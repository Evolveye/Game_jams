import type Game from "../Game"
import { WORLD, type Point, type Rect } from "../logic/world"
import Entity from "./Entity"
import Health from "./Health"
import Inventory from "./items/Inventory"
import type Item from "./items/Item"
import type { SwingStats } from "./items/items"

/** Player tuning, in world units and seconds. */
const STATS = {
  health: 5,
  runSpeed: 70,
  walkSpeed: 30,
  swingDuration: 0.15,
  stunDuration: 0.35,
  invulnerableDuration: 0.8,
}

/** While moving: largest angle between the walking direction and an aimed swing (to each side). */
const MAX_AIM_ANGLE = Math.PI / 6

/**
 * Largest angle between the swing direction and a kid that still gets hit (to each side).
 * Together with the aim angle, everything hittable stays in front of the walking direction.
 */
const HIT_ANGLE = Math.PI / 4

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

  /** Kept between days. The fist is always there, toys are added when picked up. */
  inventory = new Inventory([ `fist` ])
  /** Filled up at the start of every day. */
  health = new Health( STATS.health )

  stunTime = 0
  invulnerableTime = 0
  swingTime = 0
  #swungItem: null | Item = null
  #swingDirection: Point = { x:1, y:0 }
  #autoWalk: null | AutoWalk = null

  constructor( game:Game ) {
    super( game, 0, 0, 4 )
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
    this.inventory.update( seconds )
    this.health.update( seconds )

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

  /**
   * Swings the selected item and hits every kid in reach in front of the swing.
   * Without a target it swings straight ahead. An aimed swing (e.g. at the mouse) goes anywhere
   * while standing, but only within a small angle in front of the walking direction while moving.
   */
  useToy( target?:Point ) {
    if (this.#autoWalk || this.stunTime) return

    const item = this.inventory.selected
    const swing = item?.swing()
    if (!item || !swing) return

    const swingDirection = target ? this.#aim( target ) : this.facing

    this.swingTime = STATS.swingDuration
    this.#swungItem = item
    this.#swingDirection = swingDirection

    for (const kid of this.game.level?.kids ?? []) {
      if (this.measureGapTo( kid ) > swing.reach) continue

      const direction = this.getDirectionTo( kid )
      if (direction.x * swingDirection.x + direction.y * swingDirection.y < Math.cos( HIT_ANGLE )) continue

      kid.takeHit( direction, swing )
    }
  }

  /** Hit by a kid's swing: hurt and knocked back as hard as its toy hits, stunned, then briefly invulnerable. */
  takeHit( direction:Point, swing:SwingStats ) {
    if (this.invulnerableTime || this.#autoWalk) return

    this.health.damage( swing.damage )
    this.push( direction, swing.knockback )
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

  /**
   * Direction of a swing aimed at the target. Standing still, the player turns to the target freely.
   * While moving, the direction is turned back to the edge of the aim angle if it points too far to the side.
   */
  #aim( target:Point ) {
    if (target.x === this.x && target.y === this.y) return this.facing

    const isMoving = this.moveInput.x !== 0 || this.moveInput.y !== 0

    if (!isMoving) {
      this.facing = this.getDirectionTo( target )
      return this.facing
    }

    const facingAngle = Math.atan2( this.facing.y, this.facing.x )
    const targetAngle = Math.atan2( target.y - this.y, target.x - this.x )

    // Shortest signed turn from facing to the target, between -π and π.
    const turn = Math.atan2( Math.sin( targetAngle - facingAngle ), Math.cos( targetAngle - facingAngle ) )
    const limitedTurn = Math.min( Math.max( turn, -MAX_AIM_ANGLE ), MAX_AIM_ANGLE )

    return { x:Math.cos( facingAngle + limitedTurn ), y:Math.sin( facingAngle + limitedTurn ) }
  }

  /** Placeholder swing: a line from the body in the swing direction. */
  #drawSwing( ctx:CanvasRenderingContext2D ) {
    const definition = this.#swungItem?.definition
    if (!definition?.swing) return

    const length = this.radius + definition.swing.reach
    const direction = this.#swingDirection

    ctx.strokeStyle = definition.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo( this.x, this.y )
    ctx.lineTo( this.x + direction.x * length, this.y + direction.y * length )
    ctx.stroke()
  }
}
