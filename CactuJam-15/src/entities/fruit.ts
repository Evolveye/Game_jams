import { Rect } from "../logic/shapes"
import { SpritesStorage } from "../logic/Sprite"
import fruitImgSrc from "./fruit.png"
import type { Drawable, DrawData } from "../logic/World"

export class Fruit implements Drawable {
  boundary: Rect

  #drawCount = 0
  sprites = new SpritesStorage({
    idle: {
      src: fruitImgSrc,
      framesPerRow: 2,
      framesPerColumn: 2,
      framePixelsPadding: 1,
    },
  })

  constructor( x:number, y:number, sizeUnit:number, public tagOn:undefined | string ) {
    this.boundary = new Rect( x, y, sizeUnit * 7, sizeUnit * 9 )
  }

  updateTagOn( tag?:string ) {
    this.tagOn = tag
  }

  draw({ ctx }:DrawData) {
    const pos = this.boundary

    this.#drawCount++
    if (this.#drawCount % 30 === 0) this.sprites.current?.nextFrame()
    this.sprites.current?.draw( ctx, pos.x, pos.y, pos.width, pos.height )
  }
}
