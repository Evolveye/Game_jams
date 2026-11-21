import type Game from "../Game"
import heartEmptyIcon from "../assets/sprites/heart-empty.png"
import heartFullIcon from "../assets/sprites/heart-full.png"
import playerSheet from "../assets/sprites/player.png"
import { Sprite } from "../logic/engine"
import { WORLD, type Point, type Rect } from "../logic/world"
import Entity from "./Entity"
import Health from "./Health"
import Inventory from "./items/Inventory"
import type { SwingStats } from "./items/items"
import Swing from "./items/Swing"

/** Player tuning, in world units and seconds. */
const STATS = {
  health: 5,
  runSpeed: 70,
  walkSpeed: 30,
  stunDuration: 0.35,
  invulnerableDuration: 0.8,
}

/** The player's sheet: 10×14 frames, 4 per row, one animation per row. */
const SHEET = { src:playerSheet, framesPerRow:4, framesPerColumn:4 }

const ANIMATIONS = {
  idle: { ...SHEET, firstFrame:0, framesCount:2, fps:2 },
  walk: { ...SHEET, firstFrame:4, framesCount:4, fps:10 },
  stunned: { ...SHEET, firstFrame:8, framesCount:1 },
  swing: { ...SHEET, firstFrame:12, framesCount:1 },
}

/** Heart images of the player's health in the HUD. */
export const HEART_ICONS = { full:heartFullIcon, empty:heartEmptyIcon }

/** While moving: largest angle between the walking direction and an aimed swing (to each side). */
const MAX_AIM_ANGLE = Math.PI / 6

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
  sprite = new Sprite( ANIMATIONS, `idle` )
  hurtboxSize = { width:8, height:14 }
  debugColor = `#60a5fa`

  stunTime = 0
  invulnerableTime = 0
  #autoWalk: null | AutoWalk = null

  constructor( game:Game ) {
    super( game, 0, 0, { width:8, height:4 } )
  }

  /** Not while blinking after a hit, nor during a scripted walk. */
  get isHittable() {
    return !this.invulnerableTime && !this.#autoWalk
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
    this.inventory.update( seconds )
    this.updateSwing( seconds, this.game.level?.kids ?? [] )
    this.health.update( seconds )
    this.sprite.play( this.#getAnimation() )
    this.sprite.update( seconds )

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
   * Swings the selected item; it hits the kids it touches while the swing lasts.
   * Without a target it swings straight ahead. An aimed swing (e.g. at the mouse) goes anywhere
   * while standing, but only within a small angle in front of the walking direction while moving.
   */
  useToy( target?:Point ) {
    if (this.#autoWalk || this.stunTime) return

    const item = this.inventory.selected
    const stats = item?.swing()
    if (!item || !stats) return

    this.swing = new Swing( this, item.sprite, stats, target ? this.#aim( target ) : this.facing )
    this.game.events.emit( `toySwung`, { kind:item.kind } )
  }

  /** Hit by a kid's swing: hurt and knocked back as hard as its toy hits, stunned, then briefly invulnerable. */
  takeHit( direction:Point, swing:SwingStats ) {
    if (!this.isHittable) return

    this.health.damage( swing.damage )
    this.push( direction, swing.knockback )
    this.stunTime = STATS.stunDuration
    this.invulnerableTime = STATS.invulnerableDuration
    this.game.events.emit( `playerHit` )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    // Blink while invulnerable.
    const isBlinkHidden = this.invulnerableTime > 0 && Math.floor( this.invulnerableTime * 12 ) % 2 === 0

    this.sprite.flip.x = this.facing.x < 0

    this.drawWithSwing( ctx, () => {
      if (isBlinkHidden) return

      this.drawSprite( ctx, this.sprite )

      // The toy in hand; bare hands show nothing, and a swung toy is drawn by the swing.
      const item = this.inventory.selected
      if (item && item.kind !== `fist` && !this.swing) this.drawHeldIcon( ctx, item.sprite, this.sprite.flip.x )
    } )
  }

  #getAnimation(): keyof typeof ANIMATIONS {
    if (this.stunTime) return `stunned`
    if (this.swing) return `swing`

    const isWalking = this.#autoWalk || this.moveInput.x || this.moveInput.y
    return isWalking ? `walk` : `idle`
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

}
