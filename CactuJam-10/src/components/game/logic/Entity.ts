import Sprite from "./Sprite"

export type EntityConfig = {
  spriteSrc?: string
  framesPerRow?: number
  framesPerColumn?: number
  framesCount?: number
}

export default class Entity {
  #sprite:Sprite
  x: number
  y: number

  constructor( x:number, y:number, { spriteSrc, framesPerRow, framesPerColumn, framesCount }:EntityConfig ) {
    this.#sprite = !spriteSrc ? null : new Sprite( spriteSrc, framesPerRow, framesPerColumn, framesCount )
    this.x = x
    this.y = y
  }

  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, width?:number, height?:number) => this.#sprite?.draw( ctx, x, y, width, height )
  nextFrame = () => this.#sprite.nextFrame()
}
