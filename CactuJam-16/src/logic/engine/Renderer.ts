export type Size = { width:number, height:number }

/**
 * Draws on a given canvas in world units: the world is scaled to fit the canvas (letterboxed)
 * and stays crisp on high-DPI screens. The canvas size is controlled by CSS.
 */
export default class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  worldSize: Size
  scale = 1
  offset = { x:0, y:0 }
  #resizeObserver: ResizeObserver

  constructor( canvas:HTMLCanvasElement, worldSize:Size ) {
    const ctx = canvas.getContext( `2d` )
    if (!ctx) throw new Error( `Canvas 2D context is not available` )

    this.canvas = canvas
    this.ctx = ctx
    this.worldSize = worldSize

    this.#resizeObserver = new ResizeObserver( () => this.resize() )
    this.#resizeObserver.observe( this.canvas )
    this.resize()
  }

  resize() {
    const pixelRatio = window.devicePixelRatio
    const width = Math.round( this.canvas.clientWidth * pixelRatio )
    const height = Math.round( this.canvas.clientHeight * pixelRatio )
    if (!width || !height) return

    this.canvas.width = width
    this.canvas.height = height

    // Whole-number scale keeps pixel art sharp; below 1 it has to be fractional.
    const fitScale = Math.min( width / this.worldSize.width, height / this.worldSize.height )

    this.scale = fitScale >= 1 ? Math.floor( fitScale ) : fitScale
    this.offset.x = Math.round( (width - this.worldSize.width * this.scale) / 2 )
    this.offset.y = Math.round( (height - this.worldSize.height * this.scale) / 2 )

    this.ctx.imageSmoothingEnabled = false
  }

  beginFrame( backgroundColor?:string ) {
    this.ctx.setTransform( 1, 0, 0, 1, 0, 0 )

    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor
      this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height )
    } else this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height )

    this.ctx.setTransform( this.scale, 0, 0, this.scale, this.offset.x, this.offset.y )
  }

  destroy() {
    this.#resizeObserver.disconnect()
  }
}
