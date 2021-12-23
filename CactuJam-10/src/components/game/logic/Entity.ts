import Keys, { SimplifiedKeyBinds } from "./Keys"
import Sprite from "./Sprite"
import Level from "./Level"

export type EntityConfig = {
  labels?: string []
  spriteSrc?: string
  framesPerRow?: number
  framesPerColumn?: number
  framesCount?: number
  keyBinds?: SimplifiedKeyBinds
  size?: number
}

export default class Entity {
  #sprite:Sprite
  #world:Level

  labels:string[]
  keys:Keys
  angle:number
  x:number
  y:number
  w:number
  h:number


  constructor( x:number, y:number, { labels, size = 1, keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount }:EntityConfig = {} ) {
    this.labels = labels
    this.keys = new Keys(keyBinds)
    this.#sprite = !spriteSrc ? null : new Sprite( spriteSrc, framesPerRow, framesPerColumn, framesCount )
    this.x = x
    this.y = y
    this.w = size
    this.h = size
  }


  setAngle = (angle:number) => this.angle = Math.PI / 180 * angle
  setExistingWorld = (world:Level) => this.#world = world
  setSize( width, height = width ) {
    this.w = width
    this.h = height
  }


  isKey = (code:string) => this.keys.is( code )
  isKeyOnce = (code:string) => this.keys.isOnce( code )


  getWorld = () => this.#world
  getTilePos = (x = this.x, y = this.y) => {
    return {
      x: Math.floor( x + this.w / 2 ),
      y: Math.floor( y + this.h / 2 ),
    }
  }
  getThingImOn = () => {
    const pos = this.getTilePos()
    return this.#world?.getCell( pos.x, pos.y )?.top()
  }


  nextFrame = () => this.#sprite.nextFrame()
  draw = (ctx:CanvasRenderingContext2D, tileSize:number, x:number = this.x, y:number = this.y, width:number = this.w, height:number = this.h) => {
    const widthOnTile = width * tileSize
    const heightOnTile = height * tileSize
    const halfW = widthOnTile / 2
    const halfH = heightOnTile / 2

    ctx.save()
    ctx.translate( (x + 0.5) * tileSize, (y + 0.5) * tileSize )
    ctx.rotate( -this.angle )

    this.#sprite?.draw( ctx, -halfW, -halfH, widthOnTile, heightOnTile )

    ctx.restore()
  }

  tick = (tFrame:number):void => { tFrame }
}
