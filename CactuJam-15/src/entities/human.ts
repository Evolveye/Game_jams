
import { Point, Rect } from "../logic/shapes"
import { SpritesStorage } from "../logic/Sprite"
import humanWomenImgSrc from "./human-women.png"
import humanWomenWalkImgSrc from "./human-women-walk.png"
import humanWomenChildImgSrc from "./human-women-child.png"
import humanWomenChildWalkImgSrc from "./human-women-child-walk.png"
import humanMenImgSrc from "./human-men.png"
import humanMenWalkImgSrc from "./human-men-walk.png"
import humanMenChildImgSrc from "./human-men-child.png"
import humanMenChildWalkImgSrc from "./human-men-child-walk.png"
import humanGraveImgSrc from "./human-grave.png"
import type { Drawable, DrawData } from "../logic/World"

export type HumanStage = `young` | `adult` | `old` | `dead`

export class HumanEntity implements Drawable {
  stage = `adult` as HumanStage
  speed = 5
  velocity: Point = new Point( 0, 0 )
  collideBoundary: Rect
  locked = false
  inventory = {
    fruits: 0,
  }

  belowSurface = false
  // timeToGrow = 1000 * 60 * 5
  timeToGrow = 1000 * 60 * 2
  #sizeUnit: number
  #drawCount = 0
  #growIntervalId = 0

  constructor(
    public boundary:Rect,
    public sprites:SpritesStorage<`idle` | `walking` | `childIdle` | `childWalking` | `grave`>,
    sizeUnit:number,
    public tagOn:undefined | string,
  ) {
    this.#sizeUnit = sizeUnit
    this.collideBoundary = new Rect( boundary.x, boundary.y + boundary.height - 15, boundary.width, 15 )

    this.#growIntervalId = window.setInterval( () => {
      this.timeToGrow -= Math.min( 1000, this.timeToGrow )

      if (this.timeToGrow === 0 && !this.locked) {
        if (this.stage === `young`) this.changeStage( `adult` )
        else if (this.stage === `adult`) {
          window.clearInterval( this.#growIntervalId )
          this.changeStage( `dead` )
        }
      }
    }, 1000 )
  }

  updateBoundaries() {
    this.collideBoundary.x = this.boundary.x
    this.collideBoundary.y = this.boundary.y + this.boundary.height - 15
    this.collideBoundary.width = this.boundary.width
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
    if (this.belowSurface) return this.speed + (4 - this.speed) * 2
    return this.speed
  }

  changeSprite( type:`idle` | `walking` ) {
    if (this.stage === `young`) {
      switch (type) {
        case `idle`: return this.sprites.changeSprite( `childIdle` )
        case `walking`: return this.sprites.changeSprite( `childWalking` )
      }
    } else if (this.stage === `adult`) {
      switch (type) {
        case `idle`: return this.sprites.changeSprite( `idle` )
        case `walking`: return this.sprites.changeSprite( `walking` )
      }
    }
  }

  changeStage( stage:HumanStage ) {
    if (stage === `young` && (this.stage === `adult` || this.stage === `old`)) {
      this.boundary.width -= 5 * this.#sizeUnit
      this.boundary.height -= 10 * this.#sizeUnit
      this.updateBoundaries()
    }

    if (stage === `young`) {
      this.speed = 7
      this.timeToGrow = 1000 * 60 * 5
      this.sprites.changeSprite( `childIdle` )
    }

    if (stage === `adult`) {
      this.timeToGrow = 1000 * 60 * 5
      this.speed = 5
      this.sprites.changeSprite( `idle` )
    }

    if (stage === `dead`) {
      this.speed = 0
      this.sprites.changeSprite( `grave` )
    }

    this.stage = stage
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
          framePixelsPadding: 1,
        },
        walking: {
          src: humanWomenWalkImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 1,
        },
        childIdle: {
          src: humanWomenChildImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 1,
        },
        childWalking: {
          src: humanWomenChildWalkImgSrc,
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
      sizeUnit,
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
        childIdle: {
          src: humanMenChildImgSrc,
          framesPerRow: 3,
          framesPerColumn: 2,
          framesCount: 4,
          framePixelsPadding: 1,
        },
        childWalking: {
          src: humanMenChildWalkImgSrc,
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
      sizeUnit,
      tagOn,
    )
  }
}
