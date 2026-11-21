import type Game from "../../Game"
import kidSheet from "../../assets/sprites/kid.png"
import { Sprite } from "../../logic/engine"
import { SANDBOX, WORLD, type Point } from "../../logic/world"
import Entity from "../Entity"
import Health from "../Health"
import Inventory from "../items/Inventory"
import { FIST_SWING, ITEMS, type SwingStats } from "../items/items"
import Swing from "../items/Swing"

/**
 * - `playing`: wanders around its spot in the sandbox, harmless
 * - `hostile`: chases the player and pushes them
 * - `fleeing`: runs off the playground and is gone once off-screen
 */
export type KidState = `playing` | `hostile` | `fleeing`

/** Kid tuning, in world units and seconds. */
const STATS = {
  health: 3,
  playSpeed: 12,
  chaseSpeed: 42,
  fleeSpeed: 95,
  wanderRange: { x:30, y:20 },
  idleTime: { min:1, max:3 },
  stunDuration: 0.4,
  /** How far inside its swing's reach the kid walks before winding up. */
  approachMargin: 1,
  attackWindup: 0.35,
  /** Shortest pause between attacks; a slower toy makes it longer. */
  attackCooldown: 1.1,
}

/** Bare hands, swung by kids without a toy. Shared by all kids. */
const FIST_ICON = new Sprite({ icon:{ src:ITEMS.fist.icon } }, `icon` )

/** Health pips show for a while after a hit, then fade out. */
const HEALTH_PIPS_TIME = { visible:2, fade:0.5 }

/** The kid's sheet: 10×14 frames, 4 per row, one animation per row. */
const SHEET = { src:kidSheet, framesPerRow:4, framesPerColumn:5 }

const ANIMATIONS = {
  idle: { ...SHEET, firstFrame:0, framesCount:2, fps:2 },
  walk: { ...SHEET, firstFrame:4, framesCount:4, fps:8 },
  angry: { ...SHEET, firstFrame:8, framesCount:4, fps:8 },
  windup: { ...SHEET, firstFrame:12, framesCount:1 },
  stunned: { ...SHEET, firstFrame:16, framesCount:1 },
}

/** Distance beyond the screen edge where a fleeing kid disappears. */
const EXIT_MARGIN = 12

/** A kid in the sandbox. Peaceful until something makes it hostile. */
export default class Kid extends Entity {
  state: KidState = `playing`
  health = new Health( STATS.health )
  isGone = false
  /** Toys the kid holds. A beaten kid drops them. */
  inventory = new Inventory()
  sprite = new Sprite( ANIMATIONS, `idle` )
  hurtboxSize = { width:8, height:14 }
  debugColor = `#f87171`

  stunTime = 0
  windupTime = 0
  cooldownTime = 0

  #home: Point
  #wanderTarget: Point
  #idleTime = 0
  #exit: null | Point = null

  // Each kid is a bit different, so a group does not move in lockstep.
  #chaseSpeed = STATS.chaseSpeed * (0.85 + Math.random() * 0.3)

  constructor( game:Game, x:number, y:number ) {
    super( game, x, y, { width:8, height:4 } )
    this.#home = { x, y }
    this.#wanderTarget = { x, y }
    this.#idleTime = Math.random() * STATS.idleTime.max
  }

  /** A fleeing kid is out of the game. */
  get isHittable() {
    return this.state !== `fleeing`
  }

  /** Turns a playing kid into an enemy. */
  becomeHostile() {
    if (this.state !== `playing`) return

    this.state = `hostile`

    // Stagger the first attacks, so the kids do not all strike at once.
    this.cooldownTime = Math.random() * STATS.attackCooldown
  }

  /**
   * Hit by the player: a playing kid runs away at once (unless it has toys to defend),
   * a hostile one only when out of health, dropping its toys.
   */
  takeHit( direction:Point, swing:SwingStats ) {
    if (!this.isHittable) return

    this.push( direction, swing.knockback )
    // A hit interrupts the kid's own attack.
    this.stunTime = STATS.stunDuration
    this.windupTime = 0
    this.swing = null
    this.game.events.emit( `kidHit`, { kid:this } )

    if (this.state === `hostile`) this.health.damage( swing.damage )

    // A kid holding toys defends them instead of running away.
    if (this.state === `playing` && this.inventory.items.length) this.becomeHostile()

    if (this.health.isEmpty) this.dropToys()
    if (this.state === `playing` || this.health.isEmpty) this.flee()
  }

  /** Leaves every held toy on the ground where the kid stands. */
  dropToys() {
    const level = this.game.level
    if (!level) return

    for (const item of [ ...this.inventory.items ]) {
      if (item.kind === `fist`) continue

      this.inventory.remove( item.kind )
      level.placeToy( item.kind, this.x, this.y )
    }
  }

  /** Runs to the nearest edge of the playground and leaves. */
  flee() {
    if (this.state === `fleeing`) return

    this.state = `fleeing`
    this.swing = null
    this.#exit = this.#findExit()
    this.game.events.emit( `kidFled`, { kid:this } )
  }

  update( seconds:number ) {
    const lastPosition = { x:this.x, y:this.y }

    this.#act( seconds )
    this.#updateSprite( lastPosition, seconds )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    ctx.globalAlpha = this.state === `fleeing` ? 0.6 : 1

    this.drawWithSwing( ctx, () => {
      this.drawSprite( ctx, this.sprite )

      // The toy in hand; a swung one is drawn by the swing.
      const toy = this.inventory.selected
      if (toy && !this.swing) this.drawHeldIcon( ctx, toy.sprite, this.sprite.flip.x )
    } )

    ctx.globalAlpha = 1

    // Only enemies show health, and only for a while after a hit.
    const { visible, fade } = HEALTH_PIPS_TIME
    const healthOpacity = Math.min( 1, (visible - this.health.secondsSinceChange) / fade )
    if (this.state === `hostile` && healthOpacity > 0) this.drawHealthPips( ctx, this.health, healthOpacity )
  }

  /** One frame of the kid's behavior in its current state. */
  #act( seconds:number ) {
    this.stunTime = Math.max( 0, this.stunTime - seconds )
    this.cooldownTime = Math.max( 0, this.cooldownTime - seconds )
    this.health.update( seconds )
    this.updateSwing( seconds, [ this.game.player ] )

    this.applyVelocity( seconds )

    if (this.state === `fleeing`) return this.#runAway( seconds )

    if (!this.stunTime && this.state === `playing`) this.#play( seconds )
    if (!this.stunTime && this.state === `hostile`) this.#fight( seconds )

    this.#avoidOthers()
    this.keepInside( SANDBOX )
  }

  /** Picks the animation and the side the kid looks at, from what it did this frame. */
  #updateSprite( lastPosition:Point, seconds:number ) {
    const deltaX = this.x - lastPosition.x
    const isWalking = Math.hypot( deltaX, this.y - lastPosition.y ) > 0.01

    // Enemies look at the player, the others where they walk.
    if (this.state === `hostile`) this.sprite.flip.x = this.game.player.x < this.x
    else if (Math.abs( deltaX ) > 0.01) this.sprite.flip.x = deltaX < 0

    this.sprite.play( this.#getAnimation( isWalking ) )
    this.sprite.update( seconds )
  }

  /** Wanders between random spots near home, resting for a while at each one. */
  #play( seconds:number ) {
    if (this.#idleTime > 0) {
      this.#idleTime -= seconds
      return
    }

    if (!this.moveTowards( this.#wanderTarget, STATS.playSpeed, seconds )) return

    const { idleTime, wanderRange } = STATS

    this.#idleTime = idleTime.min + Math.random() * (idleTime.max - idleTime.min)
    const wanderSpot = {
      x: this.#home.x + (Math.random() - 0.5) * wanderRange.x * 2,
      y: this.#home.y + (Math.random() - 0.5) * wanderRange.y * 2,
    }

    // A spot beyond the border could never be reached, so the kid would never rest.
    this.#wanderTarget = this.clampInside( wanderSpot, SANDBOX )
  }

  /** Chases the player, winds up, then swings the held toy (or a fist) at them. */
  #fight( seconds:number ) {
    const player = this.game.player
    const { icon, stats } = this.#getSwing()

    if (this.windupTime > 0) {
      this.windupTime -= seconds
      if (this.windupTime > 0) return

      this.swing = new Swing( this, icon, stats, this.getDirectionTo( player ) )
      this.cooldownTime = Math.max( STATS.attackCooldown, stats.cooldown )
      return
    }

    if (this.measureGapTo( player ) > stats.reach - STATS.approachMargin) {
      this.moveTowards( player, this.#chaseSpeed, seconds )
      return
    }

    if (!this.cooldownTime) this.windupTime = STATS.attackWindup
  }

  #runAway( seconds:number ) {
    if (!this.#exit || !this.moveTowards( this.#exit, STATS.fleeSpeed, seconds )) return
    this.isGone = true
  }

  /** Keeps kids from overlapping each other and the player. */
  #avoidOthers() {
    this.separateFrom( this.game.player )

    for (const kid of this.game.level?.kids ?? []) {
      if (kid !== this && kid.state !== `fleeing`) this.separateFrom( kid )
    }
  }

  /** Point just beyond the nearest screen edge. */
  #findExit() {
    const exits = [
      { x:WORLD.x - EXIT_MARGIN, y:this.y },
      { x:WORLD.x + WORLD.width + EXIT_MARGIN, y:this.y },
      { x:this.x, y:WORLD.y - EXIT_MARGIN },
      { x:this.x, y:WORLD.y + WORLD.height + EXIT_MARGIN },
    ]

    return exits.reduce( (nearest, exit) => {
      const distance = Math.hypot( exit.x - this.x, exit.y - this.y )
      const nearestDistance = Math.hypot( nearest.x - this.x, nearest.y - this.y )

      return distance < nearestDistance ? exit : nearest
    } )
  }

  /** What the kid hits with: the toy in hand, or bare hands when it holds none that can be swung. */
  #getSwing(): { icon:Sprite<string>, stats:SwingStats } {
    const toy = this.inventory.selected
    const stats = toy?.definition.swing

    return toy && stats ? { icon:toy.sprite, stats } : { icon:FIST_ICON, stats:FIST_SWING }
  }

  #getAnimation( isWalking:boolean ): keyof typeof ANIMATIONS {
    if (this.windupTime > 0) return `windup`
    if (this.stunTime) return `stunned`
    if (this.state === `hostile`) return `angry`

    return isWalking ? `walk` : `idle`
  }

}
