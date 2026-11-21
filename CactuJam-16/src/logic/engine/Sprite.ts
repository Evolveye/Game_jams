import { snapToPixels } from "./Renderer"

/** One animation: an image with a grid of frames, plus playback settings. */
export type AnimationConfig = {
  src: string
  framesPerRow?: number
  framesPerColumn?: number
  /** Grid cell where the animation starts, counted row by row; e.g. `2 * framesPerRow` for the third row. Lets one sheet hold many animations. */
  firstFrame?: number
  /** Frames the animation uses, from `firstFrame` on. Default: the rest of the grid. */
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
  /** Clockwise turn in radians, around the anchor. */
  rotation?: number
  /** Pixels cut from each side of the frame. */
  clip?: { left?:number, right?:number, top?:number, bottom?:number }
}

/** Non-transparent pixels of a frame, in frame coordinates (from its top-left corner). */
export type OpaquePixels = { width:number, height:number, pixels:{ x:number, y:number }[] }

type Animation = Required<AnimationConfig> & { image:HTMLImageElement }

export default class Sprite<Name extends string> {
  static #images = new Map<string, HTMLImageElement>()
  /** Opaque pixels per image and frame cell, read once. */
  static #opaquePixels = new Map<string, OpaquePixels>()

  flip = { x:false, y:false }

  #animations: Record<Name, Animation>
  #current: Name
  #frame = 0
  #frameTime = 0
  #isFinished = false

  /** Names come from `animations`; `initial` must be one of them. */
  constructor( animations:Animations<Name>, initial:NoInfer<Name> ) {
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
  draw( ctx:CanvasRenderingContext2D, x:number, y:number, { width, height, anchor, scale, rotation, clip }:DrawOptions = {} ) {
    const animation = this.#animations[ this.#current ]
    const { image, framesPerRow, framesPerColumn, framePixelsPadding:padding } = animation
    if (!image.complete || !image.naturalWidth) return

    const cellWidth = image.naturalWidth / framesPerRow
    const cellHeight = image.naturalHeight / framesPerColumn
    const clipLeft = clip?.left ?? 0
    const clipTop = clip?.top ?? 0

    const cell = animation.firstFrame + this.#frame
    const sourceX = cell % framesPerRow * cellWidth + padding + clipLeft
    const sourceY = Math.floor( cell / framesPerRow ) * cellHeight + padding + clipTop
    const sourceWidth = cellWidth - padding * 2 - clipLeft - (clip?.right ?? 0)
    const sourceHeight = cellHeight - padding * 2 - clipTop - (clip?.bottom ?? 0)

    const drawWidth = width ?? sourceWidth
    const drawHeight = height ?? sourceHeight

    ctx.save()
    const position = snapToPixels( ctx, x, y )

    ctx.translate( position.x, position.y )
    if (rotation) ctx.rotate( rotation )
    ctx.scale( (scale?.x ?? 1) * (this.flip.x ? -1 : 1), (scale?.y ?? 1) * (this.flip.y ? -1 : 1) )
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      -drawWidth * (anchor?.x ?? 0.5), -drawHeight * (anchor?.y ?? 1), drawWidth, drawHeight,
    )
    ctx.restore()
  }

  /** Non-transparent pixels of the current frame, e.g. to hit with exactly what is drawn. Empty until the image is loaded. */
  getOpaquePixels(): OpaquePixels {
    const animation = this.#animations[ this.#current ]
    const { image, framesPerRow, framesPerColumn, framePixelsPadding:padding } = animation
    const cell = animation.firstFrame + this.#frame
    const key = `${animation.src}#${cell}`

    const cachedPixels = Sprite.#opaquePixels.get( key )
    if (cachedPixels) return cachedPixels

    const emptyPixels = { width:0, height:0, pixels:[] }
    if (!image.complete || !image.naturalWidth) return emptyPixels

    const cellWidth = image.naturalWidth / framesPerRow
    const cellHeight = image.naturalHeight / framesPerColumn
    const width = cellWidth - padding * 2
    const height = cellHeight - padding * 2
    const canvas = document.createElement( `canvas` )
    const ctx = canvas.getContext( `2d`, { willReadFrequently:true } )
    if (!ctx) return emptyPixels

    // Copies the frame alone, to read its alpha channel.
    canvas.width = width
    canvas.height = height
    ctx.drawImage( image, cell % framesPerRow * cellWidth + padding, Math.floor( cell / framesPerRow ) * cellHeight + padding, width, height, 0, 0, width, height )

    const { data } = ctx.getImageData( 0, 0, width, height )
    const pixels = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[ (y * width + x) * 4 + 3 ] > 0) pixels.push({ x, y })
      }
    }

    const opaquePixels = { width, height, pixels }

    Sprite.#opaquePixels.set( key, opaquePixels )
    return opaquePixels
  }

  /** Waits until all images of the animations are loaded, e.g. before a level starts. */
  static preload( animations:Animations<string> ) {
    const images = Object.values( animations ).map( ({ src }) => Sprite.#loadImage( src ) )
    return Promise.all( images.map( image => image.decode() ) )
  }

  static #parseAnimation( config:AnimationConfig ): Animation {
    const framesPerRow = config.framesPerRow ?? 1
    const framesPerColumn = config.framesPerColumn ?? 1
    const firstFrame = config.firstFrame ?? 0

    return {
      src: config.src,
      image: Sprite.#loadImage( config.src ),
      framesPerRow,
      framesPerColumn,
      firstFrame,
      framesCount: config.framesCount ?? framesPerRow * framesPerColumn - firstFrame,
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
