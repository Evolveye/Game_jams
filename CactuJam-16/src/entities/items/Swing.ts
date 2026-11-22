import type { Sprite } from "../../logic/engine"
import { isPointInside, type Point } from "../../logic/world"
import type Entity from "../Entity"
import type { HitTarget } from "../Entity"
import type { SwingStats } from "./items"

/** Debug look of the pixels that hit. */
const HIT_PIXEL = { size:0.5, color:`#fde047` }

/**
 * A swing of a held item. Its icon stays in the hand, turns through the item's arc around the aimed direction
 * and is pushed out by its thrust. It hits whatever its non-transparent pixels touch, each target once.
 */
export default class Swing {
  holder: Entity
  icon: Sprite<string>
  stats: SwingStats
  direction: Point
  seconds = 0
  #hitTargets = new Set<Entity>()

  /** Icons are drawn pointing down: the handle at the top, the hitting end at the bottom. */
  constructor( holder:Entity, icon:Sprite<string>, stats:SwingStats, direction:Point ) {
    this.holder = holder
    this.icon = icon
    this.stats = stats
    this.direction = direction
  }

  get isFinished() {
    return this.seconds >= this.stats.duration
  }

  /** Goes up, away from the viewer, so it is drawn behind the holder. */
  get isBehind() {
    return this.direction.y < 0
  }

  update( seconds:number ) {
    this.seconds += seconds
  }

  /** Hits the targets the item's pixels touch now. Each target is hit once per swing. */
  hit( targets:Iterable<HitTarget> ) {
    const pixels = this.getHitPixels()

    for (const target of targets) {
      const hurtbox = target.hurtbox
      if (!hurtbox || !target.isHittable || this.#hitTargets.has( target )) continue
      if (!pixels.some( pixel => isPointInside( pixel, hurtbox ) )) continue

      this.#hitTargets.add( target )
      target.takeHit( this.holder.getDirectionTo( target ), this.stats )
    }
  }

  /** Centers of the item's non-transparent pixels in the world, where they are drawn now. */
  getHitPixels() {
    const { handle, rotation } = this.#getPlacement()
    const { width, pixels } = this.icon.getOpaquePixels()
    const cos = Math.cos( rotation )
    const sin = Math.sin( rotation )

    return pixels.map( pixel => {
      // Relative to the handle (the top-center of the icon), then turned like the drawn icon.
      const localX = pixel.x + 0.5 - width / 2
      const localY = pixel.y + 0.5

      return { x:handle.x + localX * cos - localY * sin, y:handle.y + localX * sin + localY * cos }
    } )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    const { handle, rotation } = this.#getPlacement()
    this.icon.draw( ctx, handle.x, handle.y, { anchor:{ x:0.5, y:0 }, rotation } )
  }

  /** Debug: the pixels that hit. */
  drawHitPixels( ctx:CanvasRenderingContext2D ) {
    const { size, color } = HIT_PIXEL

    ctx.fillStyle = color
    for (const pixel of this.getHitPixels()) ctx.fillRect( pixel.x - size / 2, pixel.y - size / 2, size, size )
  }

  /** Where the handle is now and how the icon is turned. */
  #getPlacement() {
    const { arc, thrust, duration } = this.stats
    const progress = Math.min( 1, this.seconds / duration )
    const { hand } = this.holder
    const handPoint = { x:this.holder.x, y:this.holder.feetY - hand.height }

    // The arc runs over the top: clockwise when aiming right, the other way when aiming left.
    const sweep = this.direction.x < 0 ? -1 : 1
    const angle = Math.atan2( this.direction.y, this.direction.x ) + sweep * arc * (progress - 0.5)
    // Pushed out and pulled back once.
    const distance = hand.distance + thrust * Math.sin( Math.PI * progress )

    return {
      handle: { x:handPoint.x + Math.cos( angle ) * distance, y:handPoint.y + Math.sin( angle ) * distance },
      // Icons point down, so they are turned from there to the swing angle.
      rotation: angle - Math.PI / 2,
    }
  }

  /**
   * How far from the holder's middle its swing reaches straight ahead: the hand, the thrust, and the item's length in pixels.
   * Until the icon is loaded, the item's `reach` stands in for its length.
   */
  static measureReach( holder:Entity, icon:Sprite<string>, stats:SwingStats ) {
    const { pixels } = icon.getOpaquePixels()
    const length = pixels.length ? pixels.reduce( (longest, pixel) => Math.max( longest, pixel.y + 1 ), 0 ) : stats.reach

    return holder.hand.distance + stats.thrust + length
  }
}
