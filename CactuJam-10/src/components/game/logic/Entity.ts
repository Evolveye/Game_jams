import Keys, { SimplifiedKeyBinds } from "./Keys"
import Sprite from "./Sprite"

export type EntityConfig = {
  spriteSrc?: string
  framesPerRow?: number
  framesPerColumn?: number
  framesCount?: number
  keyBinds?: SimplifiedKeyBinds
}

export default class Entity {
  #sprite:Sprite
  #speed = 0.2

  keys:Keys
  x:number
  y:number

  constructor( x:number, y:number, { keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount }:EntityConfig ) {
    this.keys = new Keys(keyBinds)
    this.#sprite = !spriteSrc ? null : new Sprite( spriteSrc, framesPerRow, framesPerColumn, framesCount )
    this.x = x
    this.y = y
  }

  setSpeed = (newSpeed:number) => this.#speed = newSpeed

  isKey = (code:string) => this.keys.is( code )

  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, width?:number, height?:number) => this.#sprite?.draw( ctx, x, y, width, height )
  nextFrame = () => this.#sprite.nextFrame()

  goUp = (speed = this.#speed) => this.y -= speed
  goDown = (speed = this.#speed) => this.y += speed
  goRight = (speed = this.#speed) => this.x += speed
  goLeft = (speed = this.#speed) => this.x -= speed

  tick = (tFrame:number):void => {
    throw new Error( `You should override method "tick"` )
    console.log( tFrame )
  }
}
