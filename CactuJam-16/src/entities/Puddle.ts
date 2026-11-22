import puddleImage from "../assets/sprites/puddle.png"
import { Sprite } from "../logic/engine"
import { isPointInside, type Point, type Rect } from "../logic/world"
import type { PuddleStats } from "./items/items"

/** Seconds over which a drying puddle fades out. */
const FADE_SECONDS = 1

/** Shared look of every puddle, stretched to its size. */
const PUDDLE_SPRITE = new Sprite({ puddle:{ src:puddleImage } }, `puddle` )

/** Water poured on the ground: slows down everyone standing in it, then dries up. */
export default class Puddle {
  x: number
  y: number
  stats: PuddleStats
  secondsLeft: number

  constructor( point:Point, stats:PuddleStats ) {
    this.x = point.x
    this.y = point.y
    this.stats = stats
    this.secondsLeft = stats.seconds
  }

  get isDry() {
    return this.secondsLeft <= 0
  }

  get area(): Rect {
    const { width, height } = this.stats
    return { x:this.x - width / 2, y:this.y - height / 2, width, height }
  }

  /** True when the point (e.g. an entity's feet) stands in the water. */
  contains( point:Point ) {
    return isPointInside( point, this.area )
  }

  update( seconds:number ) {
    this.secondsLeft -= seconds
  }

  draw( ctx:CanvasRenderingContext2D ) {
    const { width, height } = this.stats

    ctx.globalAlpha = Math.min( 1, this.secondsLeft / FADE_SECONDS )
    PUDDLE_SPRITE.draw( ctx, this.x, this.y, { anchor:{ x:0.5, y:0.5 }, width, height } )
    ctx.globalAlpha = 1
  }
}
