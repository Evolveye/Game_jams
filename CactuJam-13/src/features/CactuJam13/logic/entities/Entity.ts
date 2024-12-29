import Camera from "../Camera"
import Keys from "../Keys"
import Sprite from "../Sprite"

export type EntityConfig = {
  labels?: string []
  spriteSrc?: string
  framesPerRow?: number
  framesPerColumn?: number
  framesCount?: number
  width?: number
  height?: number
  sizeMultiplier?: number
  boudingBoxColor?: string
}

export type EntityDrawConfig = {
  ctx: CanvasRenderingContext2D
  camera: Camera
  drawCenter?: boolean
  inTranslationDrawer?: () => void
}

export default class Entity {
  static sizeMultiplier = 1

  sprite: undefined | Sprite

  boudingBoxColor?: string
  sizeMultiplier = Entity.sizeMultiplier
  labels: string[]
  angle: number
  x: number
  y: number
  w: number
  h: number

  halfWidth: number
  halfHeight: number


  constructor( x:number, y:number, { spriteSrc, labels = [], sizeMultiplier, height = -1, width = -1, framesPerRow, framesPerColumn, framesCount, boudingBoxColor }:EntityConfig = {} ) {
    this.labels = labels
    this.sprite = !spriteSrc ? undefined : new Sprite( spriteSrc, framesPerRow, framesPerColumn, framesCount )
    this.x = x
    this.y = y
    this.w = width
    this.h = height
    this.halfWidth = width * this.sizeMultiplier / 2
    this.halfHeight = height * this.sizeMultiplier / 2
    this.angle = 0

    if (sizeMultiplier) this.sizeMultiplier = sizeMultiplier
    this.boudingBoxColor = boudingBoxColor

    this.sprite?.onLoad( sprite => {
      this.w = sprite.getWidth()
      this.h = sprite.getHeight()
      this.halfWidth = this.w * this.sizeMultiplier / 2
      this.halfHeight = this.h * this.sizeMultiplier / 2
    } )
  }


  setAngle = (angle:number) => this.angle = Math.PI / 180 * angle
  setSize = (width:number, height = width) => {
    this.w = width
    this.h = height
  }


  isKey = (code:string) => Keys.isPressed( code )
  isKeyOnce = (code:string) => Keys.isPressedOnce( code )

  nextFrame = () => this.sprite?.nextFrame()
  update( gameSpeedMultiplier:number, ..._:any[] ):void // eslint-disable-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  update() {}
  draw( { ctx, camera, inTranslationDrawer, drawCenter }:EntityDrawConfig, x:number = this.x, y:number = this.y, width?:number, height?:number ) {
    height ??= (width ? this.h * width / this.w : this.h) * this.sizeMultiplier
    width ??= this.w * this.sizeMultiplier

    const cameraTranslate = camera.getLookingAtTranslate( this, ctx.canvas, x, y )
    const halfW = width / 2
    const halfH = height / 2

    ctx.save()
    ctx.translate( cameraTranslate.x, cameraTranslate.y )
    ctx.rotate( -this.angle )

    if (this.boudingBoxColor) {
      ctx.fillStyle = this.boudingBoxColor
      ctx.fillRect( -halfW, -halfH, width, height )
    }

    this.sprite?.draw( ctx, -halfW, -halfH, width, height )
    inTranslationDrawer?.()

    if (drawCenter) {
      ctx.beginPath()
      ctx.fillStyle = `blue`
      ctx.arc( 0, 0, 10, 0, Math.PI * 2 )
      ctx.fill()
    }

    ctx.restore()
  }

  tick = () => {
    this.nextFrame()
  }
}
