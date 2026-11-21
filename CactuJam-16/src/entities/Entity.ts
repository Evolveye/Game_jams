import type Game from "../Game"
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

  keepInside( area:Rect = WORLD ) {
    this.x = Math.min( Math.max( this.x, area.x + this.radius ), area.x + area.width - this.radius )
    this.y = Math.min( Math.max( this.y, area.y + this.radius ), area.y + area.height - this.radius )
  }

  /** Placeholder body: a square the size of the entity. */
  drawBody( ctx:CanvasRenderingContext2D, color:string ) {
    const size = this.radius * 2

    ctx.fillStyle = color
    ctx.fillRect( Math.round( this.x - this.radius ), Math.round( this.y - this.radius ), size, size )
  }
}
