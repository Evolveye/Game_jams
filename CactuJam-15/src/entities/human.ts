
import { Point, Rect } from "../logic/shapes"
import { SpritesStorage } from "../logic/Sprite"
import humanWomenImgSrc from "./human-women.png"
import humanWomenWalkImgSrc from "./human-women-walk.png"
import humanMenImgSrc from "./human-men.png"
import humanMenWalkImgSrc from "./human-men-walk.png"
import humanGraveImgSrc from "./human-grave.png"
import type { Drawable, DrawData } from "../logic/World"

export type HumanStage = `young` | `adult` | `old` | `dead`

export class HumanEntity implements Drawable {
  stage = `adult` as HumanStage
  speed = 5
  #drawCount = 0
  velocity: Point = new Point( 0, 0 )
  collideBoundary: Rect

  belowSurface = false

  constructor(
    public boundary:Rect,
    public sprites:SpritesStorage<`idle` | `walking` | `grave`>,
    public tagOn:undefined | string,
  ) {
    this.collideBoundary = new Rect( boundary.x, boundary.y + boundary.height - 15, boundary.width, 15 )
  }

  updateBoundaries() {
    this.collideBoundary.x = this.boundary.x
    this.collideBoundary.y = this.boundary.y + this.boundary.height - 15
  }

  updateTagOn( tag?:string ) {
    if (tag === `deepWater`) {
      this.stage = `dead`
      this.sprites.changeSprite( `grave` )
    }

    this.belowSurface = tag?.toLowerCase().includes( `water` ) ?? false
    this.tagOn = tag
  }

  getSpeed() {
    if (this.belowSurface) return this.speed * 0.5
    return this.speed
  }

  draw({ ctx }:DrawData) {
    const pos = this.boundary

    // TODO Debug code
    // const playerCol = this.collideBoundary
    // ctx.strokeStyle = `red`
    // ctx.beginPath()
    // ctx.rect( pos.x, pos.y, pos.width, pos.height )
    // ctx.stroke()
    // ctx.strokeStyle = `blue`
    // ctx.beginPath()
    // ctx.rect( playerCol.x + 1, playerCol.y + 1, playerCol.width - 2, playerCol.height - 2 )
    // ctx.stroke()

    this.#drawCount++
    if (this.#drawCount % (this.stage === `dead` ? 100 : 30) === 0) this.sprites.current?.nextFrame()
    if (this.belowSurface) this.sprites.current?.draw( ctx, pos.x, pos.y + pos.height * 0.45, pos.width, pos.height * 0.55, { clip:{ bottom:15 } } )
    else this.sprites.current?.draw( ctx, pos.x, pos.y, pos.width, pos.height )
  }
}

export class Women extends HumanEntity {
  static readonly #sizeMultiplier = 18

  constructor( x:number, y:number, sizeUnit:number, tagOn:string ) {
    super(
      new Rect( x, y, sizeUnit * Women.#sizeMultiplier, sizeUnit * Women.#sizeMultiplier * 2 ),
      new SpritesStorage({
        idle: {
          src: humanWomenImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 2,
        },
        walking: {
          src: humanWomenWalkImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 1,
        },
        grave: {
          src: humanGraveImgSrc,
          framesPerRow: 2,
          framesPerColumn: 2,
          framesCount: 3,
          framePixelsPadding: 1,
        },
      }),
      tagOn,
    )
  }
}

export class Men extends HumanEntity {
  static readonly #sizeMultiplier = 19

  constructor( x:number, y:number, sizeUnit:number, tagOn:string ) {
    super(
      new Rect( x, y, sizeUnit * Men.#sizeMultiplier, sizeUnit * Men.#sizeMultiplier * 2 ),
      new SpritesStorage({
        idle: {
          src: humanMenImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 1,
        },
        walking: {
          src: humanMenWalkImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 1,
        },
        grave: {
          src: humanGraveImgSrc,
          framesPerRow: 2,
          framesPerColumn: 2,
          framesCount: 3,
          framePixelsPadding: 1,
        },
      }),
      tagOn,
    )
  }
}
