import Sprite, { type SpriteConfig } from "./Sprite"
import type Camera from "./Camera"

export type EntitySprites<T extends string> =
  | { [Key in T]:SpriteConfig & { src: string } }
  & { idle: SpriteConfig & { src: string } }

export type EntityConfig<T extends string> = {
  labels?: string []
  sprites?: EntitySprites<T>
  width?: number
  height?: number
  sizeMultiplier?: number
  boudingBoxColor?: string
}

export type EntityDrawConfig = {
  ctx: CanvasRenderingContext2D
  camera: Camera
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

export default class Entity<TSprite extends string> {
  static sizeMultiplier = 1 // eslint-disable-line sonarjs/public-static-readonly -- Global, mutable value

  sprite: undefined | Sprite
  spritesStorage?: Record<TSprite, Sprite> = undefined
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


  constructor( x:number, y:number, { sprites, labels = [], sizeMultiplier, height = 0, width = 0, boudingBoxColor }:EntityConfig<TSprite> = {} ) {
    this.labels = labels
    if (sprites) {
      this.spritesStorage = Object.fromEntries( Object.entries( sprites ).map(
        ([ k, { src, ...config } ]) => [ k, new Sprite( src, config ) ],
      ) ) as Record<TSprite, Sprite>

      this.sprite = this.spritesStorage[ `idle` as keyof typeof this.spritesStorage ]
    }
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

  nextFrame = () => this.sprite?.nextFrame()
  update( gameSpeedMultiplier:number, ..._:any[] ): void // eslint-disable-line @typescript-eslint/no-explicit-any
  update() {
    this.updatesCount++
  }
  draw( { ctx, inTranslationDrawer, scale = {} }:EntityDrawConfig, x:number = this.x, y:number = this.y, width?:number, height?:number ) {
    height ??= (width ? this.h * width / this.w : this.h) * this.sizeMultiplier
    width ??= this.w * this.sizeMultiplier

    const halfW = width / 2
    const halfH = height / 2

    ctx.save()
    ctx.rotate( -this.angle )
    if (scale.x || scale.y) ctx.scale( scale.x || 1, scale.y || 1 )

    if (this.boudingBoxColor) {
      ctx.fillStyle = this.boudingBoxColor
      ctx.fillRect( -halfW, -halfH, width, height )
    }

    this.sprite?.draw( ctx, -halfW, -halfH, width, height )
    inTranslationDrawer?.()

    ctx.restore()
  }

  tick = () => {
    this.nextFrame()
  }
}
