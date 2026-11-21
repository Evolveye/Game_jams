import type Game from "../Game"
import { WORLD, type Point, type Rect } from "../logic/world"
import Entity from "./Entity"
import { FIST, TOY_SWINGS, type SwingStats, type ToyKind } from "./toys/toys"

/** Player tuning, in world units and seconds. */
const STATS = {
  runSpeed: 70,
  walkSpeed: 30,
  swingDuration: 0.15,
  stunDuration: 0.35,
  invulnerableDuration: 0.8,
}

/** Smallest dot product between facing and the direction to a kid, so only kids in front get hit. */
const HIT_CONE = 0.3

type AutoWalk = { target:Point, speed:number, resolve:() => void }

/** The player's kid: walks, holds toys and swings them at other kids. */
export default class Player extends Entity {
  /** Movement input for this frame (normalized axes), set by the game. */
  moveInput: Point = { x:0, y:0 }
  /** Switch-pace input for this frame: runs when calm, walks during a fight. Set by the game. */
  isPaceSwitched = false
  facing: Point = { x:1, y:0 }
  /** Area the player cannot leave; `null` lets them walk off the playground. Set by level scripts. */
  bounds: null | Rect = WORLD

  toys: ToyKind[] = []
  heldToy: null | ToyKind = null

  stunTime = 0
  invulnerableTime = 0
  swingTime = 0
  cooldownTime = 0
  #autoWalk: null | AutoWalk = null

  constructor( game:Game ) {
    super( game, 0, 0, 4 )
  }

  get #swing(): SwingStats {
    return (this.heldToy && TOY_SWINGS[ this.heldToy ]) || FIST
  }

  /** True while any kid is hostile. Calm means walking by default, a fight means running. */
  get #isFighting() {
    for (const kid of this.game.level?.kids ?? []) {
      if (kid.state === `hostile`) return true
    }

    return false
  }

  update( seconds:number ) {
    this.stunTime = Math.max( 0, this.stunTime - seconds )
    this.invulnerableTime = Math.max( 0, this.invulnerableTime - seconds )
    this.swingTime = Math.max( 0, this.swingTime - seconds )
    this.cooldownTime = Math.max( 0, this.cooldownTime - seconds )

    this.applyVelocity( seconds )

    // Scripted walking ignores input and may start off-screen, so it skips the bounds.
    if (this.#autoWalk) return this.#continueAutoWalk( seconds )
    if (!this.stunTime) this.#steer( seconds )

    if (this.bounds) this.keepInside( this.bounds )
  }

  /** Puts the player at a spot, resetting movement and any scripted walk. */
  placeAt( x:number, y:number ) {
    this.x = x
    this.y = y
    this.velocity = { x:0, y:0 }
    this.stunTime = 0
    this.#autoWalk = null
  }

  /** Walks to the target on its own (input is ignored meanwhile). Resolves on arrival. */
  walkTo( target:Point, speed = 30 ) {
    return new Promise<void>( resolve => {
      this.#autoWalk = { target, speed, resolve }
    } )
  }

  addToy( kind:ToyKind ) {
    if (!this.toys.includes( kind )) this.toys.push( kind )
    this.heldToy = kind
  }

  cycleToy( step:number ) {
    if (!this.toys.length) return

    const index = this.heldToy ? this.toys.indexOf( this.heldToy ) : -1
    const count = this.toys.length

    this.heldToy = this.toys[ (index + step + count) % count ] ?? null
  }

  /** Swings the held toy (or a fist) and hits every kid in reach in front of the player. */
  useToy() {
    if (this.#autoWalk || this.stunTime || this.cooldownTime) return

    const swing = this.#swing

    this.swingTime = STATS.swingDuration
    this.cooldownTime = swing.cooldown

    for (const kid of this.game.level?.kids ?? []) {
      if (this.measureGapTo( kid ) > swing.reach) continue

      const direction = this.getDirectionTo( kid )
      if (direction.x * this.facing.x + direction.y * this.facing.y < HIT_CONE) continue

      kid.takeHit( direction, swing )
    }
  }

  /** Hit by a kid: knocked back, stunned for a moment, then briefly invulnerable. */
  takeHit( direction:Point, strength:number ) {
    if (this.invulnerableTime || this.#autoWalk) return

    this.push( direction, strength )
    this.stunTime = STATS.stunDuration
    this.invulnerableTime = STATS.invulnerableDuration
    this.game.events.emit( `playerHit` )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    // Blink while invulnerable.
    const isBlinkHidden = this.invulnerableTime > 0 && Math.floor( this.invulnerableTime * 12 ) % 2 === 0
    if (!isBlinkHidden) this.drawBody( ctx, this.stunTime ? `#93c5fd` : `#3b82f6` )

    if (this.swingTime) this.#drawSwing( ctx )
  }

  #steer( seconds:number ) {
    const { x, y } = this.moveInput
    const length = Math.hypot( x, y )
    if (!length) return

    // Switching pace flips the default: run when calm, walk during a fight.
    const isRunning = this.#isFighting !== this.isPaceSwitched
    const speed = isRunning ? STATS.runSpeed : STATS.walkSpeed

    this.facing = { x:x / length, y:y / length }
    this.x += this.facing.x * speed * seconds
    this.y += this.facing.y * speed * seconds
  }

  #continueAutoWalk( seconds:number ) {
    const autoWalk = this.#autoWalk
    if (!autoWalk) return

    this.facing = this.getDirectionTo( autoWalk.target )
    if (!this.moveTowards( autoWalk.target, autoWalk.speed, seconds )) return

    this.#autoWalk = null
    autoWalk.resolve()
  }

  /** Placeholder swing: a line from the body towards the facing direction. */
  #drawSwing( ctx:CanvasRenderingContext2D ) {
    const swing = this.#swing
    const length = this.radius + swing.reach

    ctx.strokeStyle = swing.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo( this.x, this.y )
    ctx.lineTo( this.x + this.facing.x * length, this.y + this.facing.y * length )
    ctx.stroke()
  }
}
