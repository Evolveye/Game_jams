import type Game from "../../Game"
import fatKidSheet from "../../assets/sprites/fat-kid.png"
import kidSheet from "../../assets/sprites/kid.png"
import rainBootsImage from "../../assets/sprites/rain-boots.png"
import thiefSheet from "../../assets/sprites/thief.png"
import { Sprite } from "../../logic/engine"
import { findPointBeyondEdge, SANDBOX, type Point, type Rect } from "../../logic/world"
import Entity from "../Entity"
import Health from "../Health"
import Inventory from "../items/Inventory"
import type ToyPickup from "../items/ToyPickup"
import { FIST_SWING, ITEMS, type HitStats, type RideStats, type SwingStats, type ThrowStats, type WaterStats } from "../items/items"
import Projectile from "../items/Projectile"
import Swing from "../items/Swing"
import { PLAYER_HEALTH } from "../Player"

/**
 * - `playing`: wanders around its spot, harmless
 * - `stealing`: runs in from off-screen for a toy lying on the ground; grabbing it, it turns hostile. One hit scares it away.
 * - `entering`: runs in from off-screen to its spot (e.g. the next wave), then turns hostile; hits hurt it already
 * - `hostile`: chases the player and attacks them
 * - `fleeing`: runs off the playground and is gone once off-screen
 */
export type KidState = `playing` | `stealing` | `entering` | `hostile` | `fleeing`

/**
 * How a kid fights, in world units and seconds:
 * - `health`: health points before it runs away (a fist takes 1, a spade 2); as much as the player's by default
 * - `chaseSpeed`: how fast it chases the player (or keeps its distance when throwing or watering)
 * - `attackWindup`: how long it winds up before attacking, the player's time to react
 * - `attackCooldown`: shortest pause between attacks; a slower toy makes it longer
 * - `knockbackFactor`: multiplies how far its hits push the player (below 1: weaker pushes, the player stays in reach)
 */
export type KidTraits = { health:number, chaseSpeed:number, attackWindup:number, attackCooldown:number, knockbackFactor:number }

/** Names of a kid's animations. */
type KidAnimation = keyof ReturnType<typeof createAnimations>

/** Where around the player a kid attacks from, seen from where the player faces. */
export type Approach = keyof typeof APPROACH_ANGLES

/**
 * - `traits`: how it fights (`regular` by default)
 * - `approach`: where around the player it attacks from; without it, it goes straight at the player
 * - `bounds`: the area it stays in (the sandbox by default)
 * - `hasRainBoots`: walks through puddles at full speed
 * - `body`: how it is built (`regular` by default)
 */
export type KidOptions = {
  traits?: keyof typeof KID_TRAITS
  approach?: Approach
  bounds?: Rect
  hasRainBoots?: boolean
  body?: keyof typeof KID_BODIES
}

/** The regular kid, as healthy as the player. */
const REGULAR_TRAITS:KidTraits = { health:PLAYER_HEALTH, chaseSpeed:42, attackWindup:0.35, attackCooldown:1.1, knockbackFactor:1 }

/** Kid types, from the easiest. */
export const KID_TRAITS = {
  slow: { ...REGULAR_TRAITS, chaseSpeed:26, attackWindup:0.55, attackCooldown:1.6 },
  regular: REGULAR_TRAITS,
  /** Rapid, weak jabs: attacks often, but pushes the player only half as far, so the next jab lands too. */
  quick: { ...REGULAR_TRAITS, chaseSpeed:56, attackWindup:0.3, attackCooldown:0.5, knockbackFactor:0.5 },
} satisfies Record<string, KidTraits>

/** Angles from the way the player faces; positive turns clockwise (to the player's right). */
const APPROACH_ANGLES = {
  front: 0,
  frontRight: Math.PI / 4,
  right: Math.PI / 2,
  behindRight: Math.PI * 3 / 4,
  behind: Math.PI,
  behindLeft: -Math.PI * 3 / 4,
  left: -Math.PI / 2,
  frontLeft: -Math.PI / 4,
}

/** Sides tried when a kid's own side around the player is blocked: its own first, then ever further to either side. */
const FREE_SIDE_OFFSETS = [ 0, 1, -1, 2, -2, 3, -3, 4 ].map( eighths => eighths * Math.PI / 4 )

/** Turns tried when a riding kid's way is blocked: straight first, then in 40° steps to either side, up to 120°. */
const OPEN_DIRECTION_OFFSETS = [ 0, 1, -1, 2, -2, 3, -3 ].map( steps => steps * Math.PI * 2 / 9 )

/** Tuning shared by all kids, in world units and seconds. */
const STATS = {
  playSpeed: 12,
  fleeSpeed: 95,
  stealSpeed: 50,
  wanderRange: { x:30, y:20 },
  idleTime: { min:1, max:3 },
  stunDuration: 0.4,
  /** How far inside its swing's real reach the kid walks before winding up, so the swing lands even if the player steps back a bit. */
  approachMargin: 3,
  /** How close to its attack spot around the player counts as there. */
  spotTolerance: 4,
  /** A kid with its own side (`approach`) circles the player this far beyond its reach, out of reach and not touching. */
  circleMargin: 10,
  /** How far ahead around the player (radians) a circling kid heads at a time. */
  circleStep: 0.7,
  /** Within this angle (radians) of its side, the kid stops circling and steps in. */
  sideTolerance: 0.45,
  /** How fast (radians per second) a kid's side follows the player turning, so turning around does not send kids running in circles. */
  sideTurnSpeed: 1.6,
  /** A waypoint pushed this far by the bounds counts as blocked, so the kid circles the other way. */
  blockedDistance: 6,
  /** The player looks away from a kid when the angle between their facing and the kid is bigger than this (radians). */
  lookAwayAngle: Math.PI * 0.6,
  /** A throwing (or watering) kid backs away when the player is closer than this, and comes closer beyond `throwRange` × its range. */
  throwDistance: 35,
  throwRange: 0.8,
  /** A watering kid makes puddles this far from the player, at a random side, so they close in around them. */
  puddleRing: { min:6, max:18 },
  /** The pause after each attack is its usual length times a random factor in this range, so kids do not attack in sync. */
  attackPaceVariation: { min:0.75, max:1.35 },
  /** Throws and splashes land up to this far from where the kid aims, so two kids never hit the very same spot. */
  aimSpread: 6,
  /** Touching a hostile kid hurts. */
  contact: { damage:1, knockback:90 },
  /** A kid on a ride goes at this part of the ride's speed. */
  rideSpeedFactor: 0.75,
  /** A riding kid bounces off the edges of its area, each bounce turned up to this angle (radians) towards the player. */
  bounceAim: 0.5,
  /** While driving, a riding kid steers towards the player at this speed (radians per second): gently, so it can be dodged. */
  rideTurnSpeed: 0.8,
  /** Bouncing off the player, a riding kid turns up to this angle (radians) off the straight way back, and needs `openDistance` of room ahead. */
  bumpSpread: 0.7,
  openDistance: 12,
}

/** Rain boots over a kid's feet. Shared by all kids wearing them. */
const RAIN_BOOTS_SPRITE = new Sprite({ boots:{ src:rainBootsImage } }, `boots` )

/** Bare hands, swung by kids without a toy. Shared by all kids. */
const FIST_ICON = new Sprite({ icon:{ src:ITEMS.fist.icon } }, `icon` )

/** Health pips show for a while after a hit, then fade out. */
const HEALTH_PIPS_TIME = { visible:2, fade:0.5 }

/** The regular kid's body: 4 looks (calm T-shirt, hair, trousers). Sheet frames are 12×14, like the player's. */
const REGULAR_BODY = { sheet:kidSheet, looks:4, footprint:{ width:8, height:4 }, hurtbox:{ width:8, height:14 }, hand:{ height:7, distance:2 }, speedFactor:1, healthFactor:1, damageBonus:0, isSteady:false }

/**
 * How kids are built: the sprite sheet and how many looks it has (each kid gets one at random), footprint and hurtbox sizes, the hands (see `Entity.hand`),
 * multipliers of speed and health, a damage bonus added to everything it hits with (every toy, and touching),
 * and whether it is steady: hits hurt it, but do not push it back or interrupt it.
 * Sheets have 4 frames per row, one animation per row (idle, walk, angry, windup, stunned), the looks one under another.
 */
const KID_BODIES = {
  regular: REGULAR_BODY,
  /** A regular kid in bluish clothes, so thieves stand out (see `Level.addLurkingThieves`). */
  thief: { ...REGULAR_BODY, sheet:thiefSheet },
  /** Bigger, a bit slower, tougher, steady and stronger (+1 damage), with long arms: every toy reaches further. Sheet frames are 14×15. */
  fat: { sheet:fatKidSheet, looks:1, footprint:{ width:12, height:5 }, hurtbox:{ width:12, height:15 }, hand:{ height:7, distance:7 }, speedFactor:0.8, healthFactor:1.5, damageBonus:1, isSteady:true },
}

/** A kid on the playground. Peaceful until something makes it hostile. */
export default class Kid extends Entity {
  state: KidState = `playing`
  traits: KidTraits
  health: Health
  /** Where around the player it attacks from, as an angle from where the player faces; `null` goes straight at them. */
  approachAngle: null | number
  bounds: Rect
  /** Puddles do not slow it down. */
  hasRainBoots: boolean
  isGone = false
  /** Toys the kid holds. A beaten kid drops them; a toy to throw from makes it a thrower. */
  inventory = new Inventory()
  sprite: Sprite<KidAnimation>
  /** Multiplies how fast it walks and chases, from its body. */
  bodySpeedFactor: number
  /** Its body is steady: hits do not push it back or interrupt it (riding kids are steady too, see `#isSteady`). */
  hasSteadyBody: boolean
  /** Added to the damage of everything it hits with, from its body. */
  damageBonus: number
  debugColor = `#f87171`

  stunTime = 0
  windupTime = 0
  cooldownTime = 0

  #home: Point
  #wanderTarget: Point
  #idleTime = 0
  #exit: null | Point = null
  /** Which way a riding kid drives now. */
  #rideDirection: null | Point = null
  /** Angle around the player of the side it attacks from now; follows the player's facing slowly. */
  #side: null | number = null
  /** Which way it circles the player: 1 clockwise, -1 the other way, 0 not chosen yet. */
  #circleDirection = 0
  // Each kid is a bit different, so a group does not move in lockstep.
  #speedVariation = 0.85 + Math.random() * 0.3

  constructor( game:Game, x:number, y:number, options:KidOptions = {} ) {
    const { traits = `regular`, approach, bounds = SANDBOX, hasRainBoots = false, body = `regular` } = options
    const build = KID_BODIES[ body ]

    super( game, x, y, build.footprint )
    this.hurtboxSize = build.hurtbox
    this.hand = build.hand
    this.bodySpeedFactor = build.speedFactor
    this.hasSteadyBody = build.isSteady
    this.damageBonus = build.damageBonus
    this.sprite = new Sprite( createAnimations( build.sheet, build.looks, Math.floor( Math.random() * build.looks ) ), `idle` )
    this.traits = KID_TRAITS[ traits ]
    this.health = new Health( Math.round( this.traits.health * build.healthFactor ) )
    this.approachAngle = approach ? APPROACH_ANGLES[ approach ] : null
    this.bounds = bounds
    this.hasRainBoots = hasRainBoots
    this.#home = { x, y }
    this.#wanderTarget = { x, y }
    this.#idleTime = Math.random() * STATS.idleTime.max
  }

  /** Rain boots keep full speed in puddles. */
  get groundSpeedFactor() {
    return this.hasRainBoots ? 1 : super.groundSpeedFactor
  }

  /**
   * A fleeing kid is out of the game. Nobody can be hit before the player walks into the sandbox,
   * so the fight cannot be won from outside (e.g. throwing sand from the entrance).
   */
  get isHittable() {
    return this.state !== `fleeing` && Boolean( this.game.level?.hasPlayerEntered )
  }

  /** Steady kids (a steady body, or riding) are not pushed back or interrupted by hits, so they cannot be stun-locked. */
  get #isSteady() {
    return this.hasSteadyBody || Boolean( this.#getRide() )
  }

  get #chaseSpeed() {
    return this.traits.chaseSpeed * this.#speedVariation * this.bodySpeedFactor * this.groundSpeedFactor
  }

  /** Turns a playing kid into an enemy. */
  becomeHostile() {
    if (this.state !== `playing`) return

    this.state = `hostile`

    // Stagger the first attacks, so the kids do not all strike at once.
    this.cooldownTime = Math.random() * this.traits.attackCooldown
  }

  /**
   * Hit by the player: a playing kid runs away at once (unless it has toys to defend), and so does a thief before it grabs a toy.
   * A hostile one runs only when out of health, dropping its toys.
   */
  takeHit( direction:Point, hit:HitStats ) {
    if (!this.isHittable) return

    // A hit pushes the kid back and interrupts its own attack, unless it is steady (it only gets hurt).
    if (!this.#isSteady) {
      this.push( direction, hit.knockback )
      this.stunTime = STATS.stunDuration
      this.windupTime = 0
      this.swing = null
    }

    if (this.state === `hostile` || this.state === `entering`) this.health.damage( hit.damage )

    // Sent after the damage, so listeners see whether the hit beat the kid (before it drops its toys).
    this.game.events.emit( `kidHit`, { kid:this, kind:hit.kind } )

    // A kid holding toys defends them instead of running away.
    if (this.state === `playing` && this.inventory.items.length) this.becomeHostile()

    if (this.health.isEmpty) this.dropToys()
    if (this.state === `playing` || this.state === `stealing` || this.health.isEmpty) this.flee()
  }

  /** Leaves every held toy on the ground where the kid stands. */
  dropToys() {
    const level = this.game.level
    if (!level) return

    for (const item of [ ...this.inventory.items ]) {
      if (item.kind === `fist`) continue

      this.inventory.remove( item.kind )
      level.dropToy( item.kind, this.x, this.y )
    }
  }

  /** Puts the kid off-screen (e.g. at `findPointBeyondEdge`), to run in to its spot and attack from there. */
  enterFrom( point:Point ) {
    this.x = point.x
    this.y = point.y
    this.state = `entering`
  }

  /** Runs to the nearest edge of the playground and leaves. */
  flee() {
    if (this.state === `fleeing`) return

    this.state = `fleeing`
    this.swing = null
    this.#exit = findPointBeyondEdge( this )
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
      const toy = this.inventory.selected
      const rideItem = this.#getRideItem()

      // Riding, with a second toy in hand if it holds one (e.g. a watering can).
      if (rideItem) {
        const heldToy = this.inventory.items.find( item => item !== rideItem && item.kind !== `fist` )

        this.drawRider( ctx, rideItem.sprite, this.sprite )
        if (heldToy) this.drawHeldIcon( ctx, heldToy.sprite, this.sprite.flip.x )
        return
      }

      this.drawSprite( ctx, this.sprite )
      if (this.hasRainBoots) this.drawSprite( ctx, RAIN_BOOTS_SPRITE )

      // The toy in hand; a swung one is drawn by the swing.
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
    if (this.state === `stealing`) return this.#steal( seconds )
    if (this.state === `entering`) return this.#enter( seconds )

    if (!this.stunTime && this.state === `playing`) this.#play( seconds )
    if (!this.stunTime && this.state === `hostile`) this.#fight( seconds )

    this.#avoidOthers()
    this.keepInside( this.bounds )

    // Touching a hostile kid hurts, and running into one on a ride hurts as much as the ride rams.
    const ride = this.#getRide()
    const contact = this.#strengthen( ride ? ride.ram : STATS.contact )
    if (this.state === `hostile` && !this.stunTime) this.hitOnContact( seconds, [ this.game.player ], contact )
  }

  /** Picks the animation and the side the kid looks at, from what it did this frame. */
  #updateSprite( lastPosition:Point, seconds:number ) {
    const deltaX = this.x - lastPosition.x
    const isWalking = Math.hypot( deltaX, this.y - lastPosition.y ) > 0.01

    // Enemies look at the player (riding ones where they drive), the others where they walk.
    if (this.state === `hostile` && !this.#getRide()) this.sprite.flip.x = this.game.player.x < this.x
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

    if (!this.moveTowards( this.#wanderTarget, STATS.playSpeed * this.bodySpeedFactor * this.groundSpeedFactor, seconds )) return

    const { idleTime, wanderRange } = STATS

    this.#idleTime = idleTime.min + Math.random() * (idleTime.max - idleTime.min)
    const wanderSpot = {
      x: this.#home.x + (Math.random() - 0.5) * wanderRange.x * 2,
      y: this.#home.y + (Math.random() - 0.5) * wanderRange.y * 2,
    }

    // A spot beyond the border could never be reached, so the kid would never rest.
    this.#wanderTarget = this.clampInside( wanderSpot, this.bounds )
  }

  /** Gets into position, winds up, then attacks: swings the toy in hand (or a fist), or throws from it. */
  #fight( seconds:number ) {
    const ride = this.#getRide()

    if (ride) {
      this.#ride( seconds, ride )
      this.#useWhileRiding()
      return
    }

    if (this.windupTime > 0) {
      this.windupTime -= seconds
      if (this.windupTime <= 0) this.#attack()
      return
    }

    const range = this.#getRange()
    const isInPosition = range ? this.#keepDistance( seconds, range ) : this.#approach( seconds )

    if (isInPosition && !this.cooldownTime) this.windupTime = this.traits.attackWindup
  }

  #attack() {
    const player = this.game.player
    const { throwing, watering } = this.inventory.selected?.definition ?? {}

    if (throwing) {
      this.#throwAt( player, throwing )
      this.#restAfterAttack( throwing.cooldown )
      return
    }

    if (watering) {
      this.#waterAround( player, watering )
      this.#restAfterAttack( watering.cooldown )
      return
    }

    const { icon, stats } = this.#getSwing()

    this.swing = new Swing( this, icon, this.#strengthen( stats ), this.getDirectionTo( player ) )
    this.#restAfterAttack( stats.cooldown )
  }

  /**
   * On a ride: drives without stopping, like a bumper car, steering gently towards the player. It bounces off the edges
   * of its area, each bounce turned a little towards the player, and off the player after running into them
   * (ramming them, see the contact in `#act`).
   */
  #ride( seconds:number, ride:RideStats ) {
    const player = this.game.player
    const towardsPlayer = this.getDirectionTo( player )
    const direction = this.#rideDirection ? turnTowards( this.#rideDirection, towardsPlayer, STATS.rideTurnSpeed * seconds ) : towardsPlayer
    const step = ride.speed * STATS.rideSpeedFactor * this.groundSpeedFactor * seconds
    const wantedPoint = { x:this.x + direction.x * step, y:this.y + direction.y * step }
    const reachablePoint = this.clampInside( wantedPoint, this.bounds )

    this.x = reachablePoint.x
    this.y = reachablePoint.y
    this.#rideDirection = direction

    // Bumped into the player: drives away from them, sideways when a wall is behind, so it never gets stuck between them.
    if (this.measureGapTo( player ) <= 0) {
      const away = player.getDirectionTo( this )
      const awayAngle = Math.atan2( away.y, away.x ) + randomBetween( -STATS.bumpSpread, STATS.bumpSpread )

      this.#rideDirection = this.#findOpenDirection({ x:Math.cos( awayAngle ), y:Math.sin( awayAngle ) })
      return
    }

    const isBouncingX = reachablePoint.x !== wantedPoint.x
    const isBouncingY = reachablePoint.y !== wantedPoint.y
    if (!isBouncingX && !isBouncingY) return

    const bouncedDirection = { x:isBouncingX ? -direction.x : direction.x, y:isBouncingY ? -direction.y : direction.y }
    this.#rideDirection = turnTowards( bouncedDirection, this.getDirectionTo( player ), STATS.bounceAim )
  }

  /** The direction, or the closest one turned to either side (random side first), where the bounds leave room to drive. */
  #findOpenDirection( direction:Point ) {
    const angle = Math.atan2( direction.y, direction.x )
    const side = Math.random() < 0.5 ? 1 : -1

    for (const offset of OPEN_DIRECTION_OFFSETS) {
      const turnedAngle = angle + side * offset
      const turnedDirection = { x:Math.cos( turnedAngle ), y:Math.sin( turnedAngle ) }
      const probe = { x:this.x + turnedDirection.x * STATS.openDistance, y:this.y + turnedDirection.y * STATS.openDistance }

      if (!this.#isBlocked( probe )) return turnedDirection
    }

    return direction
  }

  /** Waits before the next attack: at least as long as the toy needs, a bit longer or shorter every time. */
  #restAfterAttack( toyCooldown:number ) {
    const { min, max } = STATS.attackPaceVariation
    this.cooldownTime = Math.max( this.traits.attackCooldown, toyCooldown ) * randomBetween( min, max )
  }

  /**
   * Gets into swinging reach. Without its own side it goes straight at the player. With one, it circles the player
   * out of reach to that side (so a group surrounds them instead of queuing), then steps in.
   * Returns `true` when it can swing.
   */
  #approach( seconds:number ) {
    const player = this.game.player
    const attackGap = this.#getAttackGap()
    const isInReach = this.measureGapTo( player ) <= attackGap

    if (this.approachAngle === null) {
      if (!isInReach) this.moveTowards( player, this.#chaseSpeed, seconds )
      return isInReach
    }

    const side = this.#turnSide( seconds )
    const kidAngle = Math.atan2( this.y - player.y, this.x - player.x )
    const angleLeft = wrapAngle( side - kidAngle )

    // On its side: steps in.
    if (Math.abs( angleLeft ) < STATS.sideTolerance) {
      const spot = this.#getSpotAround( side, attackGap )
      const isAtSpot = this.moveTowards( spot, this.#chaseSpeed, seconds ) || Math.hypot( spot.x - this.x, spot.y - this.y ) < STATS.spotTolerance

      this.#circleDirection = 0
      return isInReach && isAtSpot
    }

    // An opening on the way: in reach while the player looks away.
    if (isInReach && this.#isPlayerLookingAway()) return true

    this.moveTowards( this.#findCircleWaypoint( kidAngle, angleLeft, attackGap + STATS.circleMargin ), this.#chaseSpeed, seconds )
    return false
  }

  /**
   * Turns the side it attacks from towards its place around the player's facing, at a limited speed.
   * When that place is blocked (e.g. the player stands at a wall), it takes the nearest free one. Returns the side's angle.
   */
  #turnSide( seconds:number ) {
    const player = this.game.player
    const wantedSide = this.#findFreeSide( Math.atan2( player.facing.y, player.facing.x ) + (this.approachAngle ?? 0) )

    if (this.#side === null) this.#side = wantedSide

    const maxTurn = STATS.sideTurnSpeed * seconds
    this.#side += Math.min( Math.max( wrapAngle( wantedSide - this.#side ), -maxTurn ), maxTurn )

    return this.#side
  }

  /** The side closest to the angle where the kid fits within its bounds, checked every eighth of a turn. */
  #findFreeSide( angle:number ) {
    const gap = this.#getAttackGap()

    for (const offset of FREE_SIDE_OFFSETS) {
      const side = angle + offset
      if (!this.#isBlocked( this.#getSpotAround( side, gap, false ) )) return side
    }

    return angle
  }

  /** True when the bounds keep the kid far from the point. */
  #isBlocked( point:Point ) {
    const reachable = this.clampInside( point, this.bounds )
    return Math.hypot( reachable.x - point.x, reachable.y - point.y ) > STATS.blockedDistance
  }

  /**
   * Next point on the way around the player, `gap` away from them. Circles the shorter way at first,
   * and keeps its way until it reaches its side, unless the bounds block it (e.g. a wall): then it turns back.
   */
  #findCircleWaypoint( kidAngle:number, angleLeft:number, gap:number ) {
    if (!this.#circleDirection) this.#circleDirection = Math.sign( angleLeft ) || 1

    for (const direction of [ this.#circleDirection, -this.#circleDirection ]) {
      const waypoint = this.#getSpotAround( kidAngle + direction * STATS.circleStep, gap, false )
      if (this.#isBlocked( waypoint )) continue

      this.#circleDirection = direction
      return waypoint
    }

    // Blocked both ways (e.g. in a corner): straight for its side.
    return this.#getSpotAround( kidAngle + angleLeft, gap )
  }

  /** Point around the player at the angle, where footprints are `gap` apart; kept within bounds unless `isClamped` is off. */
  #getSpotAround( angle:number, gap:number, isClamped = true ) {
    const player = this.game.player
    const cos = Math.cos( angle )
    const sin = Math.sin( angle )

    // Footprints are boxes, so the distance for the same gap differs horizontally and vertically.
    const horizontalDistance = (gap + (this.footprint.width + player.footprint.width) / 2) / Math.abs( cos )
    const verticalDistance = (gap + (this.footprint.height + player.footprint.height) / 2) / Math.abs( sin )
    const distance = Math.min( horizontalDistance, verticalDistance )
    const spot = { x:player.x + cos * distance, y:player.y + sin * distance }

    return isClamped ? this.clampInside( spot, this.bounds ) : spot
  }

  /** True when the player faces away from this kid. */
  #isPlayerLookingAway() {
    const player = this.game.player
    const toKid = player.getDirectionTo( this )
    const facingDot = player.facing.x * toKid.x + player.facing.y * toKid.y

    return facingDot < Math.cos( STATS.lookAwayAngle )
  }

  /** Stays within its toy's range but out of the player's reach. Returns `true` when it can use the toy. */
  #keepDistance( seconds:number, range:number ) {
    const player = this.game.player
    const distance = Math.hypot( player.x - this.x, player.y - this.y )

    if (distance > range * STATS.throwRange) {
      this.moveTowards( player, this.#chaseSpeed, seconds )
      return false
    }

    // Too close: backs away, but can still throw (e.g. when cornered).
    if (distance < STATS.throwDistance) {
      const away = player.getDirectionTo( this )
      const retreat = this.clampInside( { x:this.x + away.x * 10, y:this.y + away.y * 10 }, this.bounds )

      this.moveTowards( retreat, this.#chaseSpeed, seconds )
    }

    return true
  }

  /** Throws at where the target stands now; the clump hits only the player. */
  #throwAt( target:Point, throwing:ThrowStats ) {
    const level = this.game.level
    if (!level) return

    const player = this.game.player
    const landing = this.#findLanding( this.#scatter( target ), throwing.range )

    level.launch( new Projectile( this.game, this, landing, throwing.speed, { hit:this.#strengthen( throwing ), getTargets:() => [ player ] } ) )
    if (throwing.sound) this.game.sounds.play( throwing.sound, { rateVariation:0.1, volume:0.6 } )
  }

  /** Splashes water onto a random spot around the target, so the puddles close in on them. */
  #waterAround( target:Point, watering:WaterStats ) {
    const level = this.game.level
    if (!level) return

    const { min, max } = STATS.puddleRing
    const angle = Math.random() * Math.PI * 2
    const distance = min + Math.random() * (max - min)
    const spot = { x:target.x + Math.cos( angle ) * distance, y:target.y + Math.sin( angle ) * distance }
    const landing = this.#findLanding( spot, watering.range )
    const player = this.game.player

    level.launch( new Projectile( this.game, this, landing, watering.speed, {
      look: `water`,
      hit: this.#strengthen( watering ),
      getTargets: () => [ player ],
      onLand: point => level.pour( point, watering.puddle ),
    } ) )
    if (watering.sound) this.game.sounds.play( watering.sound, { rateVariation:0.1, volume:0.6 } )
  }

  /** A random point near the given one, up to the aim spread away. */
  #scatter( point:Point ) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * STATS.aimSpread

    return { x:point.x + Math.cos( angle ) * distance, y:point.y + Math.sin( angle ) * distance }
  }

  /** Where something thrown at the point lands: there when in range, otherwise as far as it goes towards it. */
  #findLanding( point:Point, range:number ) {
    const direction = this.getDirectionTo( point )
    const distance = Math.min( range, Math.hypot( point.x - this.x, point.y - this.y ) )

    return { x:this.x + direction.x * distance, y:this.y + direction.y * distance }
  }

  /** Runs for the nearest toy on the ground; grabbing it, it holds it and turns hostile. Leaves when no toy is left. */
  #steal( seconds:number ) {
    const level = this.game.level
    if (!level || this.stunTime) return

    const toy = this.#findToyToSteal( level.toys )
    if (!toy) return this.flee()

    const isThere = this.moveTowards( toy, STATS.stealSpeed * this.groundSpeedFactor, seconds ) || this.measureGapTo( toy ) <= 0
    if (!isThere) return

    level.takeToy( toy )
    this.inventory.add( toy.kind )
    this.state = `playing`
    this.becomeHostile()
    this.game.events.emit( `toyStolen`, { kid:this, kind:toy.kind } )
  }

  /** Runs in to its spot from off-screen (out of its bounds meanwhile), then attacks. */
  #enter( seconds:number ) {
    if (this.stunTime) return

    const isThere = this.moveTowards( this.#home, STATS.stealSpeed * this.groundSpeedFactor, seconds )
    if (!isThere) return

    this.state = `playing`
    this.becomeHostile()
  }

  /** The nearest toy still lying on the ground. */
  #findToyToSteal( toys:Iterable<ToyPickup> ) {
    let nearestToy: null | ToyPickup = null

    for (const toy of toys) {
      if (toy.isTaken) continue
      if (!nearestToy || this.measureGapTo( toy ) < this.measureGapTo( nearestToy )) nearestToy = toy
    }

    return nearestToy
  }

  #runAway( seconds:number ) {
    if (!this.#exit || !this.moveTowards( this.#exit, STATS.fleeSpeed * this.groundSpeedFactor, seconds )) return
    this.isGone = true
  }

  /** Keeps kids from overlapping each other, the player, and babies. */
  #avoidOthers() {
    this.separateFrom( this.game.player )

    for (const baby of this.game.level?.babies ?? []) this.separateFrom( baby )

    for (const kid of this.game.level?.kids ?? []) {
      if (kid !== this && kid.state !== `fleeing`) this.separateFrom( kid )
    }
  }

  /** What the kid swings: the toy in hand, or bare hands when it holds none that can be swung. */
  #getSwing(): { icon:Sprite<string>, stats:SwingStats } {
    const toy = this.inventory.selected
    const stats = toy?.definition.swing

    return toy && stats ? { icon:toy.sprite, stats } : { icon:FIST_ICON, stats:FIST_SWING }
  }

  /**
   * Gap between footprints from which the kid's swing lands on the player: the swing's real reach from the kid's middle,
   * up to the near edge of the player's hurtbox, minus a margin.
   */
  #getAttackGap() {
    const player = this.game.player
    const { icon, stats } = this.#getSwing()
    const playerHalfWidth = (player.hurtboxSize?.width ?? player.footprint.width) / 2
    const centersDistance = Swing.measureReach( this, icon, stats ) + playerHalfWidth

    return centersDistance - (this.footprint.width + player.footprint.width) / 2 - STATS.approachMargin
  }

  /** The hit with the body's damage bonus added, and its knockback scaled by the kid's traits. */
  #strengthen<Hit extends HitStats>( hit:Hit ): Hit {
    const { knockbackFactor } = this.traits
    if (!this.damageBonus && knockbackFactor === 1) return hit

    return { ...hit, damage:hit.damage + this.damageBonus, knockback:hit.knockback * knockbackFactor }
  }

  /**
   * A riding kid holding a toy used from a distance (sand, water) uses it on the way, without stopping:
   * whenever it is ready and the player is within its range.
   */
  #useWhileRiding() {
    const definition = this.inventory.items.find( item => item.definition.throwing || item.definition.watering )?.definition
    if (!definition || this.cooldownTime) return

    const player = this.game.player
    const { throwing, watering } = definition
    const range = throwing?.range ?? watering?.range ?? 0
    if (Math.hypot( player.x - this.x, player.y - this.y ) > range) return

    if (throwing) {
      this.#throwAt( player, throwing )
      this.#restAfterAttack( throwing.cooldown )
    }

    if (watering) {
      this.#waterAround( player, watering )
      this.#restAfterAttack( watering.cooldown )
    }
  }

  /** The held toy to ride (e.g. the car): a kid holding one rides it, whichever toy is selected. */
  #getRideItem() {
    return this.inventory.items.find( item => item.definition.ride ) ?? null
  }

  /** How the kid rides, when it holds a toy to ride. */
  #getRide() {
    return this.#getRideItem()?.definition.ride ?? null
  }

  /** Range of the toy in hand when it is used from a distance (throwing sand, watering), `null` for swinging. */
  #getRange() {
    const { throwing, watering } = this.inventory.selected?.definition ?? {}
    return throwing?.range ?? watering?.range ?? null
  }

  #getAnimation( isWalking:boolean ): KidAnimation {
    if (this.windupTime > 0) return `windup`
    if (this.stunTime) return `stunned`
    if (this.state === `hostile` || this.state === `entering`) return `angry`

    return isWalking ? `walk` : `idle`
  }
}

/** The same angle between -π and π, e.g. the shorter turn between two angles. */
function wrapAngle( angle:number ) {
  return Math.atan2( Math.sin( angle ), Math.cos( angle ) )
}

/** A random number from `min` up to `max`. */
function randomBetween( min:number, max:number ) {
  return min + Math.random() * (max - min)
}

/**
 * A kid's animations from its sheet: 4 frames per row, one animation per row, `looks` blocks of them one under another.
 * `look`: the block to use, from 0.
 */
function createAnimations( sheet:string, looks = 1, look = 0 ) {
  const frames = { src:sheet, framesPerRow:4, framesPerColumn:5 * looks }
  const firstFrame = look * 5 * 4

  return {
    idle: { ...frames, firstFrame, framesCount:2, fps:2 },
    walk: { ...frames, firstFrame:firstFrame + 4, framesCount:4, fps:8 },
    angry: { ...frames, firstFrame:firstFrame + 8, framesCount:4, fps:8 },
    windup: { ...frames, firstFrame:firstFrame + 12, framesCount:1 },
    stunned: { ...frames, firstFrame:firstFrame + 16, framesCount:1 },
  }
}

/** The direction turned towards the target direction, by at most `maxTurn` radians. */
function turnTowards( direction:Point, target:Point, maxTurn:number ) {
  const angle = Math.atan2( direction.y, direction.x )
  const turn = wrapAngle( Math.atan2( target.y, target.x ) - angle )
  const turnedAngle = angle + Math.min( Math.max( turn, -maxTurn ), maxTurn )

  return { x:Math.cos( turnedAngle ), y:Math.sin( turnedAngle ) }
}
