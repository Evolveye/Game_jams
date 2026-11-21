import type Game from "../../Game"
import { snapToPixels } from "../../logic/engine"
import { SANDBOX, WORLD, type Point } from "../../logic/world"
import Entity from "../Entity"
import Inventory from "../items/Inventory"
import type { SwingStats } from "../items/items"

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
  attackReach: 2,
  attackWindup: 0.35,
  attackCooldown: 1.1,
  attackKnockback: 130,
}

/** Placeholder colors for each state. */
const COLORS = {
  playing: `#f9a8d4`,
  hostile: `#ef4444`,
  fleeing: `#fca5a5`,
  windup: `#ffffff`,
  stunned: `#fde68a`,
}

/** Distance beyond the screen edge where a fleeing kid disappears. */
const EXIT_MARGIN = 12

/** A kid in the sandbox. Peaceful until something makes it hostile. */
export default class Kid extends Entity {
  state: KidState = `playing`
  health = STATS.health
  isGone = false
  /** Toys the kid holds. A beaten kid drops them. */
  inventory = new Inventory()

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
    super( game, x, y, 4 )
    this.#home = { x, y }
    this.#wanderTarget = { x, y }
    this.#idleTime = Math.random() * STATS.idleTime.max
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
    if (this.state === `fleeing`) return

    this.push( direction, swing.knockback )
    this.stunTime = STATS.stunDuration
    this.windupTime = 0
    this.game.events.emit( `kidHit`, { kid:this } )

    if (this.state === `hostile`) this.health -= swing.damage

    // A kid holding toys defends them instead of running away.
    if (this.state === `playing` && this.inventory.items.length) this.becomeHostile()

    if (this.health <= 0) this.dropToys()
    if (this.state === `playing` || this.health <= 0) this.flee()
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
    this.#exit = this.#findExit()
    this.game.events.emit( `kidFled`, { kid:this } )
  }

  update( seconds:number ) {
    this.stunTime = Math.max( 0, this.stunTime - seconds )
    this.cooldownTime = Math.max( 0, this.cooldownTime - seconds )

    this.applyVelocity( seconds )

    if (this.state === `fleeing`) return this.#runAway( seconds )

    if (!this.stunTime && this.state === `playing`) this.#play( seconds )
    if (!this.stunTime && this.state === `hostile`) this.#fight( seconds )

    this.#avoidOthers()
    this.keepInside( SANDBOX )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    ctx.globalAlpha = this.state === `fleeing` ? 0.6 : 1
    this.drawBody( ctx, this.#getColor() )
    this.#drawHeldToy( ctx )
    ctx.globalAlpha = 1
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

  /** Chases the player, winds up, then pushes if the player is still in reach. */
  #fight( seconds:number ) {
    const player = this.game.player

    if (this.windupTime > 0) {
      this.windupTime -= seconds
      if (this.windupTime > 0) return

      if (this.measureGapTo( player ) <= STATS.attackReach * 2) {
        player.takeHit( this.getDirectionTo( player ), STATS.attackKnockback )
      }

      this.cooldownTime = STATS.attackCooldown
      return
    }

    if (this.measureGapTo( player ) > STATS.attackReach) {
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

  #getColor() {
    if (this.windupTime > 0) return COLORS.windup
    if (this.stunTime) return COLORS.stunned

    return COLORS[ this.state ]
  }

  /** Placeholder: a thin stick in the toy's color next to the body. */
  #drawHeldToy( ctx:CanvasRenderingContext2D ) {
    const toy = this.inventory.selected
    if (!toy) return

    const corner = snapToPixels( ctx, this.x + this.radius, this.y - this.radius - 2 )

    ctx.fillStyle = toy.definition.color
    ctx.fillRect( corner.x, corner.y, 2, 6 )
  }
}
