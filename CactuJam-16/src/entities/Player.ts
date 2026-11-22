import type Game from "../Game"
import heartEmptyIcon from "../assets/sprites/heart-empty.png"
import heartFullIcon from "../assets/sprites/heart-full.png"
import playerSheet from "../assets/sprites/player.png"
import { Sprite } from "../logic/engine"
import { WORLD, type Point, type Rect } from "../logic/world"
import Entity from "./Entity"
import Health from "./Health"
import Inventory from "./items/Inventory"
import type { HitStats, ThrowStats, WaterStats } from "./items/items"
import Projectile from "./items/Projectile"
import Swing from "./items/Swing"

/** The player's health, also the regular kid's: a fair fight, hit for hit. */
export const PLAYER_HEALTH = 5

/** Player tuning, in world units and seconds. */
const STATS = {
  health: PLAYER_HEALTH,
  runSpeed: 70,
  walkSpeed: 30,
  stunDuration: 0.35,
  invulnerableDuration: 0.8,
  /** How many toys the player carries, besides bare hands. */
  toyLimit: 2,
}

/** The player's sheet: 12×14 frames, 4 per row, one animation per row. */
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
  inventory = new Inventory( [ `fist` ], STATS.toyLimit )
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

  /** The selected item when it is ridden (e.g. the car). */
  get #rideItem() {
    const item = this.inventory.selected
    return item?.definition.ride ? item : null
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
    this.updateSwing( seconds, this.game.level?.getPlayerTargets() ?? [] )
    this.health.update( seconds )
    this.sprite.play( this.#getAnimation() )
    this.sprite.update( seconds )

    this.applyVelocity( seconds )

    // Scripted walking ignores input and may start off-screen, so it skips the bounds.
    if (this.#autoWalk) return this.#continueAutoWalk( seconds )
    if (!this.stunTime) this.#steer( seconds )

    if (this.bounds) this.keepInside( this.bounds )

    // A moving ride rams the kids it runs into.
    const ram = this.#rideItem?.definition.ride?.ram
    const isMoving = !this.stunTime && (this.moveInput.x || this.moveInput.y)
    if (ram && isMoving) this.hitOnContact( seconds, this.game.level?.getPlayerTargets() ?? [], ram )
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
   * Uses the selected item: swings it (it hits the kids it touches while the swing lasts) or throws from it.
   * Without a target it goes straight ahead. An aimed use (e.g. at the mouse) goes anywhere
   * while standing, but only within a small angle in front of the walking direction while moving.
   */
  useToy( target?:Point ) {
    if (this.#autoWalk || this.stunTime) return

    const item = this.inventory.selected
    const definition = item?.use()
    if (!item || !definition) return

    const direction = target ? this.#aim( target ) : this.facing

    if (definition.swing) this.swing = new Swing( this, item.sprite, definition.swing, direction )
    if (definition.throwing) this.#throw( definition.throwing, direction, target )
    if (definition.watering) this.#pour( definition.watering, direction, target )

    this.game.events.emit( `toyUsed`, { kind:item.kind } )
  }

  /**
   * Swaps the toy in hand for a toy the player stands on (one they do not have yet): the new toy takes its place,
   * and the old one is left on the ground. Bare hands are never swapped.
   */
  swapToy() {
    const level = this.game.level
    const item = this.inventory.selected
    if (!level || !item || item.kind === `fist` || this.#autoWalk) return

    const toy = [ ...level.toys ].find( toy => !toy.isTaken && !this.inventory.has( toy.kind ) && this.measureGapTo( toy ) <= 0 )
    if (!toy) return

    level.takeToy( toy )
    this.inventory.replaceSelected( toy.kind )
    level.placeToy( item.kind, this.x, this.y )
    this.game.events.emit( `toyReceived`, { kind:toy.kind } )
  }

  /** Hit by a kid (its swing, or touching it): hurt and knocked back, stunned, then briefly invulnerable. */
  takeHit( direction:Point, hit:HitStats ) {
    if (!this.isHittable) return

    this.health.damage( hit.damage )
    this.push( direction, hit.knockback )
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

      const rideItem = this.#rideItem
      const item = this.inventory.selected

      if (rideItem) return this.drawRider( ctx, rideItem.sprite, this.sprite )

      this.drawSprite( ctx, this.sprite )

      // The toy in hand; bare hands show nothing, and a swung toy is drawn by the swing.
      if (item && item.kind !== `fist` && !this.swing) this.drawHeldIcon( ctx, item.sprite, this.sprite.flip.x )
    } )
  }

  /** Throws at the kids. */
  #throw( stats:ThrowStats, direction:Point, target?:Point ) {
    const level = this.game.level
    if (!level) return

    const landing = this.#findLanding( stats.range, direction, target )
    level.launch( new Projectile( this.game, this, landing, stats.speed, { hit:stats, getTargets:() => level.getPlayerTargets() } ) )
  }

  /** Splashes water that leaves a puddle where it lands. */
  #pour( stats:WaterStats, direction:Point, target?:Point ) {
    const level = this.game.level
    if (!level) return

    const landing = this.#findLanding( stats.range, direction, target )
    level.launch( new Projectile( this.game, this, landing, stats.speed, {
      look: `water`,
      hit: stats,
      getTargets: () => level.getPlayerTargets(),
      onLand: point => level.pour( point, stats.puddle ),
    } ) )
  }

  /** Where something thrown lands: at the target when in range, otherwise as far as it goes in the direction. */
  #findLanding( range:number, direction:Point, target?:Point ) {
    const distance = target ? Math.min( range, Math.hypot( target.x - this.x, target.y - this.y ) ) : range
    return { x:this.x + direction.x * distance, y:this.y + direction.y * distance }
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

    // Switching pace flips the default: run when calm, walk during a fight. A ride has its own speed.
    const isRunning = this.#isFighting !== this.isPaceSwitched
    const speed = (this.#rideItem?.definition.ride?.speed ?? (isRunning ? STATS.runSpeed : STATS.walkSpeed)) * this.groundSpeedFactor

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
