import { Rect } from "../logic/shapes"
import { SpritesStorage } from "../logic/Sprite"
import fruitPlantImgSrc from "./fruit-plant.png"
import type { Drawable, DrawData } from "../logic/World"

export class FruitPlant implements Drawable {
  boundary: Rect

  tagOn: string | undefined = undefined
  #drawCount = 0
  sprites = new SpritesStorage({
    idle: {
      src: fruitPlantImgSrc,
      framesPerRow: 2,
      framesPerColumn: 1,
      framePixelsPadding: 1,
    },
  })

  constructor( x:number, y:number, sizeUnit:number, growCb:() => void ) {
    this.boundary = new Rect( x, y, sizeUnit * 7, sizeUnit * 9 )

    window.setTimeout( () => growCb(), 1000 * 60 )
  }

  updateTagOn( tag?:string ) {
    this.tagOn = tag
  }

  draw({ ctx }:DrawData) {
    const pos = this.boundary

    this.#drawCount++
    if (this.#drawCount % 100 === 0) this.sprites.current?.nextFrame()
    this.sprites.current?.draw( ctx, pos.x, pos.y, pos.width, pos.height )
  }
}
