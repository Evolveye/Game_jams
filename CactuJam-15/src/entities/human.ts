
import { Point, Rect } from "../logic/shapes"
import controls from "../logic/controls"
import { SpritesStorage } from "../logic/Sprite"
import Keys from "../logic/Keys"
import humanWomenImgSrc from "./human-women.png"
import humanWomenWalkImgSrc from "./human-women-walk.png"
import humanMenImgSrc from "./human-men.png"
import humanMenWalkImgSrc from "./human-men-walk.png"

export class HumanEntity {
  #drawCount = 0
  velocity: Point = new Point( 0, 0 )
  collideBoundary: Rect

  constructor(
    public boundary:Rect,
    public tagOn:undefined | string,
    public sprites:SpritesStorage<`idle` | `walking`>,
  ) {
    this.collideBoundary = new Rect( boundary.x, boundary.y + boundary.height / 2, boundary.width, boundary.height / 2 )
  }

  draw( ctx:CanvasRenderingContext2D, timeMul:number ) {
    const speed = 5 * timeMul
    const playerPos = this.boundary
    const playerVelocity = this.velocity

    if (Keys.isPressed( controls.up )) playerVelocity.y -= speed
    if (Keys.isPressed( controls.down )) playerVelocity.y += speed
    if (Keys.isPressed( controls.left )) playerVelocity.x -= speed
    if (Keys.isPressed( controls.right )) playerVelocity.x += speed

    let xFlip = false
    if (this.velocity.x > 0) this.sprites.changeSprite( `walking` )
    else if (playerVelocity.x < 0) {
      this.sprites.changeSprite( `walking` )
      xFlip = true
    } else {
      if (playerVelocity.y < 0) this.sprites.changeSprite( `walking` )
      else if (playerVelocity.y > 0) {
        this.sprites.changeSprite( `walking` )
        xFlip = true
      } else this.sprites.changeSprite( `idle` )
    }

    playerPos.x += playerVelocity.x
    playerPos.y += playerVelocity.y

    playerVelocity.x = 0
    playerVelocity.y = 0

    this.collideBoundary.x = playerPos.x
    this.collideBoundary.y = playerPos.y + playerPos.height / 2

    // TODO Debug code
    // const playerCol = this.collideBoundary
    // ctx.strokeStyle = `red`
    // ctx.beginPath()
    // ctx.rect( playerPos.x, playerPos.y, playerPos.width, playerPos.height )
    // ctx.stroke()
    // ctx.strokeStyle = `blue`
    // ctx.beginPath()
    // ctx.rect( playerCol.x, playerCol.y, playerCol.width, playerCol.height )
    // ctx.stroke()

    this.#drawCount++
    if (this.#drawCount % 30 === 0) this.sprites.current?.nextFrame()
    this.sprites.current?.draw( ctx, playerPos.x, playerPos.y, playerPos.width, playerPos.height, { x:xFlip ? -1 : 1 } )
  }
}

export class Women extends HumanEntity {
  constructor( boundary:Rect, tagOn:undefined | string ) {
    super( boundary, tagOn, new SpritesStorage({
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
    }) )
  }
}

export class Men extends HumanEntity {
  constructor( boundary:Rect, tagOn:undefined | string ) {
    super( boundary, tagOn, new SpritesStorage({
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
    }) )
  }
}
