import { snapToPixels } from "./Renderer"

/** One animation: an image with a grid of frames, plus playback settings. */
export type AnimationConfig = {
  src: string
  framesPerRow?: number
  framesPerColumn?: number
  /** Frames actually used, when the last grid row is not full. */
  framesCount?: number
  /** Empty pixels around every frame in the image. */
  framePixelsPadding?: number
  fps?: number
  loop?: boolean
}

export type Animations<Name extends string> = Record<Name, AnimationConfig>

export type DrawOptions = {
  width?: number
  height?: number
  /** Point of the drawn frame placed at (x, y), from 0 to 1. Default: bottom-center (the feet). */
  anchor?: { x?:number, y?:number }
  scale?: { x?:number, y?:number }
  /** Pixels cut from each side of the frame. */
  clip?: { left?:number, right?:number, top?:number, bottom?:number }
}

type Animation = Required<AnimationConfig> & { image:HTMLImageElement }

export default class Sprite<Name extends string> {
  static #images = new Map<string, HTMLImageElement>()

  flip = { x:false, y:false }

  #animations: Record<Name, Animation>
  #current: Name
  #frame = 0
  #frameTime = 0
  #isFinished = false

  constructor( animations:Animations<Name>, initial:Name ) {
    const entries = Object.entries<AnimationConfig>( animations ).map( ([ name, config ]) => [ name, Sprite.#parseAnimation( config ) ] )

    this.#animations = Object.fromEntries( entries )
    this.#current = initial
  }

  get current() {
    return this.#current
  }

  /** True when a non-looping animation reached its last frame. */
  get isFinished() {
    return this.#isFinished
  }

  /** Switches to an animation. Playing the current one again continues it, unless `restart` is set. */
  play( name:Name, restart = false ) {
    if (name === this.#current && !restart) return

    this.#current = name
    this.#frame = 0
    this.#frameTime = 0
    this.#isFinished = false
  }

  /** Advances the animation by game time. */
  update( seconds:number ) {
    const animation = this.#animations[ this.#current ]
    if (this.#isFinished || !animation.fps) return

    this.#frameTime += seconds

    const frameDuration = 1 / animation.fps

    while (this.#frameTime >= frameDuration) {
      this.#frameTime -= frameDuration

      if (this.#frame < animation.framesCount - 1) this.#frame++
      else if (animation.loop) this.#frame = 0
      else {
        this.#isFinished = true
        break
      }
    }
  }

  /** Draws the current frame with its anchor (by default the feet) at (x, y). */
  draw( ctx:CanvasRenderingContext2D, x:number, y:number, { width, height, anchor, scale, clip }:DrawOptions = {} ) {
    const animation = this.#animations[ this.#current ]
    const { image, framesPerRow, framesPerColumn, framePixelsPadding:padding } = animation
    if (!image.complete || !image.naturalWidth) return

    const cellWidth = image.naturalWidth / framesPerRow
    const cellHeight = image.naturalHeight / framesPerColumn
    const clipLeft = clip?.left ?? 0
    const clipTop = clip?.top ?? 0

    const sourceX = this.#frame % framesPerRow * cellWidth + padding + clipLeft
    const sourceY = Math.floor( this.#frame / framesPerRow ) * cellHeight + padding + clipTop
    const sourceWidth = cellWidth - padding * 2 - clipLeft - (clip?.right ?? 0)
    const sourceHeight = cellHeight - padding * 2 - clipTop - (clip?.bottom ?? 0)

    const drawWidth = width ?? sourceWidth
    const drawHeight = height ?? sourceHeight

    ctx.save()
    const position = snapToPixels( ctx, x, y )

    ctx.translate( position.x, position.y )
    ctx.scale( (scale?.x ?? 1) * (this.flip.x ? -1 : 1), (scale?.y ?? 1) * (this.flip.y ? -1 : 1) )
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      -drawWidth * (anchor?.x ?? 0.5), -drawHeight * (anchor?.y ?? 1), drawWidth, drawHeight,
    )
    ctx.restore()
  }

  /** Waits until all images of the animations are loaded, e.g. before a level starts. */
  static preload( animations:Animations<string> ) {
    const images = Object.values( animations ).map( ({ src }) => Sprite.#loadImage( src ) )
    return Promise.all( images.map( image => image.decode() ) )
  }

  static #parseAnimation( config:AnimationConfig ): Animation {
    const framesPerRow = config.framesPerRow ?? 1
    const framesPerColumn = config.framesPerColumn ?? 1

    return {
      src: config.src,
      image: Sprite.#loadImage( config.src ),
      framesPerRow,
      framesPerColumn,
      framesCount: config.framesCount ?? framesPerRow * framesPerColumn,
      framePixelsPadding: config.framePixelsPadding ?? 0,
      fps: config.fps ?? 8,
      loop: config.loop ?? true,
    }
  }

  static #loadImage( src:string ) {
    const cachedImage = Sprite.#images.get( src )
    if (cachedImage) return cachedImage

    const image = new Image()

    image.src = src
    Sprite.#images.set( src, image )

    return image
  }
}
