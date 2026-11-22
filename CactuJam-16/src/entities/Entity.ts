import type Game from "../Game"
import healthPipsImage from "../assets/sprites/health-pips.png"
import { Sprite, type DrawOptions } from "../logic/engine"
import { WORLD, type Point, type Rect, type Size } from "../logic/world"
import type Health from "./Health"
import type { HitStats } from "./items/items"
import type Swing from "./items/Swing"

/** Something hits can land on. */
export type HitTarget = Entity & { takeHit:(direction:Point, hit:HitStats) => void }

/** How fast knockback slows down (higher = shorter slide). */
const KNOCKBACK_DAMPING = 10

/** One health pip, full or lost. Shared: every entity draws its pips with it. */
const HEALTH_PIP_SPRITE = new Sprite({
  full: { src:healthPipsImage, framesPerRow:2, framesCount:1 },
  empty: { src:healthPipsImage, framesPerRow:2, firstFrame:1, framesCount:1 },
}, `full` )

/** Health pips in world units: pips overlap by their 1-unit outline, and float `gap` above the hurtbox. */
const HEALTH_PIPS = { size:4, step:3, gap:2 }

/** How high a rider sits on a ridden toy, and how much of the legs it hides, in world units. */
const RIDE_SEAT = { lift:4, hiddenLegs:4 }

/** Contact hits: footprints this close count as touching; the same target is hurt again only after `repeatSeconds`. */
const CONTACT = { gap:1, repeatSeconds:0.6 }

/**
 * Debug look, in world units: the footprint is filled, the hurtbox outlined.
 * The outline is solid when hits land, dashed when they do not.
 */
const DEBUG_SHAPES = { footprintOpacity:0.35, lineWidth:0.5, dash:[ 1.5, 1.5 ] }

/**
 * Something standing on the playground. `x`, `y` is the middle of its footprint (the feet on the ground),
 * which moves, pushes others apart and stays within bounds. The hurtbox (hits land on it) stands on the footprint.
 */
export default abstract class Entity {
  game: Game
  x: number
  y: number
  footprint: Size
  /** Size of the hurtbox standing on the footprint, usually the sprite's; `null` when nothing can hit it. */
  hurtboxSize: null | Size = null
  /** Where items are held, in world units: the hand is `height` above the feet, and holds items `distance` from the middle. */
  hand = { height:7, distance:2 }
  velocity: Point = { x:0, y:0 }
  /** The swing in progress, if any. */
  swing: null | Swing = null
  /** Color of the shapes drawn in debug mode. */
  debugColor = `#ffffff`
  /** Targets hurt by touching recently, with seconds until they can be hurt that way again. */
  #contactCooldowns = new Map<Entity, number>()

  constructor( game:Game, x:number, y:number, footprint:Size ) {
    this.game = game
    this.x = x
    this.y = y
    this.footprint = footprint
  }

  /** Bottom edge of the footprint, where the sprite stands. */
  get feetY() {
    return this.y + this.footprint.height / 2
  }

  get hurtbox(): null | Rect {
    if (!this.hurtboxSize) return null

    const { width, height } = this.hurtboxSize
    return { x:this.x - width / 2, y:this.feetY - height, width, height }
  }

  /** Speed multiplier of the ground it stands on: below 1 in a puddle. */
  get groundSpeedFactor() {
    return this.game.level?.getGroundSpeedFactor( this ) ?? 1
  }

  /** True when hits land on it now (e.g. not while invulnerable). Shown by the hurtbox outline in debug mode. */
  get isHittable() {
    return true
  }

  abstract update( seconds:number ): void
  abstract draw( ctx:CanvasRenderingContext2D ): void

  /** Gap between both footprints: the larger of the horizontal and vertical gaps, negative when they overlap. */
  measureGapTo( other:Entity ) {
    const gapX = Math.abs( other.x - this.x ) - (this.footprint.width + other.footprint.width) / 2
    const gapY = Math.abs( other.y - this.y ) - (this.footprint.height + other.footprint.height) / 2

    return Math.max( gapX, gapY )
  }

  /** Unit vector pointing at the target. */
  getDirectionTo( target:Point ) {
    const deltaX = target.x - this.x
    const deltaY = target.y - this.y
    const length = Math.hypot( deltaX, deltaY ) || 1

    return { x:deltaX / length, y:deltaY / length }
  }

  /** Moves straight to the target. Returns `true` once it is reached. */
  moveTowards( target:Point, speed:number, seconds:number ) {
    const distance = Math.hypot( target.x - this.x, target.y - this.y )
    const step = speed * seconds

    if (distance <= step) {
      this.x = target.x
      this.y = target.y
      return true
    }

    this.x += (target.x - this.x) / distance * step
    this.y += (target.y - this.y) / distance * step

    return false
  }

  /** Adds knockback in the given direction. */
  push( direction:Point, strength:number ) {
    this.velocity.x += direction.x * strength
    this.velocity.y += direction.y * strength
  }

  /** Moves by the knockback velocity and slows it down. */
  applyVelocity( seconds:number ) {
    const damping = Math.exp( -KNOCKBACK_DAMPING * seconds )

    this.x += this.velocity.x * seconds
    this.y += this.velocity.y * seconds
    this.velocity.x *= damping
    this.velocity.y *= damping
  }

  /** Advances the swing in progress, hitting the targets its item touches. */
  updateSwing( seconds:number, targets:Iterable<HitTarget> ) {
    if (!this.swing) return

    this.swing.update( seconds )
    this.swing.hit( targets )

    if (this.swing.isFinished) this.swing = null
  }

  /** Hurts the targets whose footprint touches this one. Call every frame while touching hurts (e.g. while hostile). */
  hitOnContact( seconds:number, targets:Iterable<HitTarget>, hit:HitStats ) {
    for (const [ target, cooldown ] of this.#contactCooldowns) {
      if (cooldown <= seconds) this.#contactCooldowns.delete( target )
      else this.#contactCooldowns.set( target, cooldown - seconds )
    }

    for (const target of targets) {
      if (!target.isHittable || this.#contactCooldowns.has( target )) continue
      if (this.measureGapTo( target ) > CONTACT.gap) continue

      this.#contactCooldowns.set( target, CONTACT.repeatSeconds )
      target.takeHit( this.getDirectionTo( target ), hit )
    }
  }

  /** Moves this entity out of another one along the shorter way, so footprints do not overlap. */
  separateFrom( other:Entity ) {
    const overlapX = (this.footprint.width + other.footprint.width) / 2 - Math.abs( this.x - other.x )
    const overlapY = (this.footprint.height + other.footprint.height) / 2 - Math.abs( this.y - other.y )
    if (overlapX <= 0 || overlapY <= 0) return

    if (overlapX < overlapY) this.x += Math.sign( this.x - other.x || 1 ) * overlapX
    else this.y += Math.sign( this.y - other.y || 1 ) * overlapY
  }

  /** Closest point to the given one where the whole footprint fits inside the area. */
  clampInside( point:Point, area:Rect = WORLD ) {
    const halfWidth = this.footprint.width / 2
    const halfHeight = this.footprint.height / 2

    return {
      x: Math.min( Math.max( point.x, area.x + halfWidth ), area.x + area.width - halfWidth ),
      y: Math.min( Math.max( point.y, area.y + halfHeight ), area.y + area.height - halfHeight ),
    }
  }

  keepInside( area:Rect = WORLD ) {
    const { x, y } = this.clampInside( this, area )

    this.x = x
    this.y = y
  }

  /** True when the whole footprint is inside the area. */
  isInside( area:Rect ) {
    const halfWidth = this.footprint.width / 2
    const halfHeight = this.footprint.height / 2

    return (
      this.x - halfWidth >= area.x && this.x + halfWidth <= area.x + area.width &&
      this.y - halfHeight >= area.y && this.y + halfHeight <= area.y + area.height
    )
  }

  /** True when no part of the footprint is inside the area. */
  isOutside( area:Rect ) {
    const halfWidth = this.footprint.width / 2
    const halfHeight = this.footprint.height / 2

    return (
      this.x + halfWidth <= area.x || this.x - halfWidth >= area.x + area.width ||
      this.y + halfHeight <= area.y || this.y - halfHeight >= area.y + area.height
    )
  }

  /** Draws the sprite standing on the bottom of the footprint (its feet), or `lift` units above it (e.g. sitting on a ride). */
  drawSprite( ctx:CanvasRenderingContext2D, sprite:Sprite<string>, { lift = 0, ...options }:DrawOptions & { lift?:number } = {} ) {
    sprite.draw( ctx, this.x, this.feetY - lift, options )
  }

  /** A rider on a ridden toy: the toy first, facing the same way, then the rider sitting in it with the legs hidden. */
  drawRider( ctx:CanvasRenderingContext2D, rideSprite:Sprite<string>, riderSprite:Sprite<string> ) {
    rideSprite.flip.x = riderSprite.flip.x

    this.drawSprite( ctx, rideSprite )
    this.drawSprite( ctx, riderSprite, { lift:RIDE_SEAT.lift, clip:{ bottom:RIDE_SEAT.hiddenLegs } } )
  }

  /** An item's icon in the hand, on the side the entity looks at. */
  drawHeldIcon( ctx:CanvasRenderingContext2D, icon:Sprite<string>, isFacingLeft:boolean ) {
    const side = isFacingLeft ? -1 : 1
    icon.draw( ctx, this.x + side * (this.footprint.width / 2 + 2), this.feetY - 1 )
  }

  /** Draws the body with the swing in progress: behind it when the swing goes up, in front otherwise. */
  drawWithSwing( ctx:CanvasRenderingContext2D, drawBody:() => void ) {
    const swing = this.swing

    if (swing?.isBehind) swing.draw( ctx )
    drawBody()
    if (swing && !swing.isBehind) swing.draw( ctx )
  }

  /** Debug: the footprint filled, the hurtbox outlined (dashed when hits do not land), and the swing's hitting pixels. */
  drawDebug( ctx:CanvasRenderingContext2D ) {
    const { footprintOpacity, lineWidth, dash } = DEBUG_SHAPES
    const { width, height } = this.footprint
    const hurtbox = this.hurtbox

    ctx.save()
    ctx.fillStyle = this.debugColor
    ctx.strokeStyle = this.debugColor
    ctx.globalAlpha = footprintOpacity
    ctx.fillRect( this.x - width / 2, this.y - height / 2, width, height )
    ctx.globalAlpha = 1

    // Inset by half the line, so the outline lies inside the box.
    if (hurtbox) {
      ctx.lineWidth = lineWidth
      ctx.setLineDash( this.isHittable ? [] : dash )
      ctx.strokeRect( hurtbox.x + lineWidth / 2, hurtbox.y + lineWidth / 2, hurtbox.width - lineWidth, hurtbox.height - lineWidth )
    }

    this.swing?.drawHitPixels( ctx )
    ctx.restore()
  }

  /** Health as pips over the hurtbox, one per point: full ones are left, empty ones are lost. */
  drawHealthPips( ctx:CanvasRenderingContext2D, health:Health, opacity = 1 ) {
    const { size, step, gap } = HEALTH_PIPS
    const rowWidth = (health.max - 1) * step + size
    const left = this.x - rowWidth / 2
    const top = this.hurtbox?.y ?? this.feetY

    ctx.globalAlpha = opacity

    for (let i = 0; i < health.max; i++) {
      HEALTH_PIP_SPRITE.play( i < health.current ? `full` : `empty` )
      HEALTH_PIP_SPRITE.draw( ctx, left + i * step, top - gap, { anchor:{ x:0, y:1 } } )
    }

    ctx.globalAlpha = 1
  }
}
