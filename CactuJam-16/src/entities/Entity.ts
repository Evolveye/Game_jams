import type Game from "../Game"
import { snapToPixels } from "../logic/engine"
import { WORLD, type Point, type Rect } from "../logic/world"

/** How fast knockback slows down (higher = shorter slide). */
const KNOCKBACK_DAMPING = 10

/** Something standing on the playground: a position, a round body, and knockback velocity. */
export default abstract class Entity {
  game: Game
  x: number
  y: number
  radius: number
  velocity: Point = { x:0, y:0 }

  constructor( game:Game, x:number, y:number, radius:number ) {
    this.game = game
    this.x = x
    this.y = y
    this.radius = radius
  }

  abstract update( seconds:number ): void
  abstract draw( ctx:CanvasRenderingContext2D ): void

  /** Distance between the edges of both bodies (negative when they overlap). */
  measureGapTo( other:Entity ) {
    return Math.hypot( other.x - this.x, other.y - this.y ) - this.radius - other.radius
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

  /** Moves this entity out of another one, so bodies do not overlap. */
  separateFrom( other:Entity ) {
    const gap = this.measureGapTo( other )
    if (gap >= 0) return

    const direction = other.getDirectionTo( this )

    this.x -= direction.x * gap
    this.y -= direction.y * gap
  }

  /** Closest point to the given one where this entity's whole body fits inside the area. */
  clampInside( point:Point, area:Rect = WORLD ) {
    return {
      x: Math.min( Math.max( point.x, area.x + this.radius ), area.x + area.width - this.radius ),
      y: Math.min( Math.max( point.y, area.y + this.radius ), area.y + area.height - this.radius ),
    }
  }

  keepInside( area:Rect = WORLD ) {
    const { x, y } = this.clampInside( this, area )

    this.x = x
    this.y = y
  }

  /** True when the whole body is inside the area. */
  isInside( area:Rect ) {
    return (
      this.x - this.radius >= area.x && this.x + this.radius <= area.x + area.width &&
      this.y - this.radius >= area.y && this.y + this.radius <= area.y + area.height
    )
  }

  /** True when no part of the body is inside the area. */
  isOutside( area:Rect ) {
    return (
      this.x + this.radius <= area.x || this.x - this.radius >= area.x + area.width ||
      this.y + this.radius <= area.y || this.y - this.radius >= area.y + area.height
    )
  }

  /** Placeholder body: a square the size of the entity. */
  drawBody( ctx:CanvasRenderingContext2D, color:string ) {
    const size = this.radius * 2
    const corner = snapToPixels( ctx, this.x - this.radius, this.y - this.radius )

    ctx.fillStyle = color
    ctx.fillRect( corner.x, corner.y, size, size )
  }
}
