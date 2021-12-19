import Keys, { SimplifiedKeyBinds } from "./Keys"
import Sprite from "./Sprite"
import TiledLevel from "./TiledLevel"

export type EntityConfig = {
  spriteSrc?: string
  framesPerRow?: number
  framesPerColumn?: number
  framesCount?: number
  keyBinds?: SimplifiedKeyBinds
  size?: number
}

export default class Entity {
  #sprite:Sprite
  #world:TiledLevel

  keys:Keys
  speed = 0.2
  angle:number
  x:number
  y:number
  w:number
  h:number


  constructor( x:number, y:number, { size, keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount }:EntityConfig ) {
    this.keys = new Keys(keyBinds)
    this.#sprite = !spriteSrc ? null : new Sprite( spriteSrc, framesPerRow, framesPerColumn, framesCount )
    this.x = x
    this.y = y
    this.w = size ?? this.#sprite.getWidth()
    this.h = size ?? this.#sprite.getHeight()
    this.angle = 0
  }


  setExistingWorld = (world:TiledLevel) => this.#world = world
  setSpeed = (newSpeed:number) => this.speed = newSpeed
  setAngle = (angle:number) => this.angle = Math.PI / 180 * angle
  setSize( width, height = width ) {
    this.w = width
    this.h = height
  }


  isKey = (code:string) => this.keys.is( code )
  isKeyOnce = (code:string) => this.keys.isOnce( code )
  getThingImOn = () => this.#world?.getCell( Math.floor( this.x + this.w / 2 ), Math.floor( this.y + this.h / 2 ) )?.top()


  draw = (ctx:CanvasRenderingContext2D, x:number = this.x, y:number = this.y, width:number = this.w, height:number = this.h) => {
    const galfW = width / 2
    const halfH = height / 2

    ctx.save()
    ctx.translate( x + galfW, y + halfH )
    ctx.rotate( -this.angle )

    this.#sprite?.draw( ctx, -galfW, -halfH, width, height )

    ctx.restore()
  }


  nextFrame = () => this.#sprite.nextFrame()


  goUp = (speed = this.speed) => {
    this.setAngle( 90 )
    this.go( speed )
  }
  goDown = (speed = this.speed) => {
    this.setAngle( 270 )
    this.go( speed )
  }
  goRight = (speed = this.speed) => {
    this.setAngle( 0 )
    this.go( speed )
  }
  goLeft = (speed = this.speed) => {
    this.setAngle( 180 )
    this.go( speed )
  }
  go = (speed = this.speed) => {
    this.x += Math.cos( this.angle ) * speed
    this.y -= Math.sin( this.angle ) * speed
  }


  tick = (tFrame:number):void => {
    throw new Error( `You should override method "tick"` )
    console.log( tFrame )
  }
}
