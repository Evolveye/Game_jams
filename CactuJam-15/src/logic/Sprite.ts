export type SpriteConfig = {
  framesPerColumn?: number
  framesPerRow?: number
  framesCount?: number
  framePixelsPadding?: number
}

export default class Sprite {
  #framesCount: number
  #framesPerRow: number
  #framesPerColumn: number
  #framePixelsPadding: number

  #spreadsheet: HTMLImageElement

  #currentFrame: number = 0
  #frameWidth: number = -1
  #frameheight: number = -1

  flip = { x:false, y:false }

  constructor( src:string, config:SpriteConfig ) {
    this.#spreadsheet = new Image()
    this.#spreadsheet.src = src

    this.#framesPerRow = config.framesPerRow ?? 1
    this.#framesPerColumn = config.framesPerColumn ?? 1
    this.#framesCount = config.framesCount ?? this.#framesPerRow * this.#framesPerColumn
    this.#framePixelsPadding = config.framePixelsPadding ?? 0

    this.#spreadsheet.addEventListener( `load`, () => {
      this.#frameWidth = this.#spreadsheet.width / this.#framesPerRow
      this.#frameheight = this.#spreadsheet.height / this.#framesPerColumn
      this.#currentFrame = 0
    }, { once:true } )
  }

  onLoad( cb:(sprite:Sprite) => void ) {
    this.#spreadsheet.addEventListener( `load`, () => cb( this ), { once:true } )
  }


  getWidth = () => this.#spreadsheet.width / this.#framesPerRow
  getHeight = () => this.#spreadsheet.height / this.#framesPerColumn


  nextFrame = () => {
    if (this.#currentFrame < this.#framesCount - 1) this.#currentFrame++
    else this.#currentFrame = 0
  }


  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, width?:number, height?:number, scale?:{ x?: number, y?: number }) => {
    const sprite = this.#spreadsheet
    const frameW = this.#frameWidth - this.#framePixelsPadding * 2
    const frameH = this.#frameheight - this.#framePixelsPadding * 2
    const frameX = this.#currentFrame % this.#framesPerRow * this.#frameWidth + this.#framePixelsPadding
    const frameY = Math.floor( this.#currentFrame / this.#framesPerRow ) * this.#frameheight + this.#framePixelsPadding

    if (!width) width = sprite.width
    if (!height) height = sprite.height

    ctx.save()
    ctx.translate( x + width / 2, y + height / 2 )
    if (scale) ctx.scale( scale.x ?? 1, scale.y ?? 1 )
    if (this.flip.x || this.flip.y) ctx.scale( this.flip.x ? -1 : 1, this.flip.y ? -1 : 1 )

    ctx.drawImage(
      sprite,
      frameX, frameY, frameW, frameH,
      -width / 2, -height / 2, width, height,
    )

    ctx.restore()
  }
}

export type Sprites<T extends string> =
  | { [Key in T]:SpriteConfig & { src: string } }
  & { idle: SpriteConfig & { src: string } }

export class SpritesStorage<TSprite extends string> {
  storage: Record<TSprite, Sprite>
  current: undefined | Sprite

  constructor( sprites:Sprites<TSprite> ) {
    this.storage = Object.fromEntries( Object.entries( sprites ).map(
      ([ k, { src, ...config } ]) => [ k, new Sprite( src, config ) ],
    ) ) as Record<TSprite, Sprite>

    this.current = this.storage[ `idle` as keyof typeof this.storage ]
  }

  changeSprite( spriteName:TSprite ) {
    this.current = this.storage[ spriteName ]
  }
}
