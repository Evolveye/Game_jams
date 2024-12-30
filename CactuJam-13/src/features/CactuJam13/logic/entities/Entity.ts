import Camera from "../Camera"
import Keys from "../Keys"
import Sprite from "../Sprite"

export type SpriteConfig = {
  framesPerRow?: number
  framesPerColumn?: number
  framesCount?: number
}

export type EntityConfig = SpriteConfig & {
  labels?: string []
  defaultSprite?: string
  sprites?: Record<string,SpriteConfig & { src:string }>
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
  translate?: {
    x?: number
    y?: number
  }
  scale?: {
    x?: number
    y?: number
  }
}

export default class Entity {
  static sizeMultiplier = 1

  sprite: undefined | Sprite
  moreSprites: Record<string,Sprite>
  updatesCount = 0

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


  constructor( x:number, y:number, { defaultSprite, sprites={},labels = [], sizeMultiplier, height = 0, width = 0, framesPerRow, framesPerColumn, framesCount, boudingBoxColor }:EntityConfig = {} ) {
    this.labels = labels
    this.moreSprites = Object.fromEntries( Object.entries(sprites).map(
      ([k,config]) => [k, new Sprite( config.src, config.framesPerRow, config.framesPerColumn, config.framesCount )]
    ))
    this.sprite = defaultSprite ? this.moreSprites[ defaultSprite ] : undefined
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
      this.w ||= sprite.getWidth()
      this.h ||= sprite.getHeight()
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
  update() {
    this.updatesCount++
  }
  draw( { ctx, camera, inTranslationDrawer, drawCenter, scale={},translate = {} }:EntityDrawConfig, x:number = this.x, y:number = this.y, width?:number, height?:number ) {
    height ??= (width ? this.h * width / this.w : this.h) * this.sizeMultiplier
    width ??= this.w * this.sizeMultiplier

    const cameraTranslate = camera.getLookingAtTranslate( this, ctx.canvas, x, y )
    const halfW = width / 2
    const halfH = height / 2

    ctx.save()
    ctx.translate( (translate.x ?? 0) + cameraTranslate.x, cameraTranslate.y )
    ctx.rotate( -this.angle )
    if (scale.x || scale.y) ctx.scale( scale.x || 1, scale.y || 1 )

    if (this.boudingBoxColor) {
      ctx.fillStyle = this.boudingBoxColor
      ctx.fillRect( -halfW, -halfH, width, height )
    }

    this.sprite?.draw( ctx, -halfW, -halfH, width, height )
    inTranslationDrawer?.()

    if (drawCenter) {
      ctx.beginPath()
      ctx.fillStyle = `white`
      ctx.arc( 0, 0, 5, 0, Math.PI * 2 )
      ctx.fill()
    }

    ctx.restore()
  }

  tick = () => {
    this.nextFrame()
  }
}
