import { Rect } from "../logic/shapes"
import type { Drawable, DrawData } from "../logic/World"

export class Fruit implements Drawable {
  boundary: Rect

  constructor( x:number, y:number, public tagOn:undefined | string ) {
    this.boundary = new Rect( x, y, 10, 10 )
  }

  updateTagOn( tag?:string ) {
    this.tagOn = tag
  }

  draw({ ctx }:DrawData) {
    ctx.fillStyle = `pink`
    ctx.fillRect( this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height )
  }
}
