export default class Drawable {
  #framesCount:number
  #framesPerRow:number
  #framesPerColumn:number
  #sprite:HTMLImageElement
  #currentFrame:number = 0
  #frameWidth:number
  #frameheight:number


  constructor( src:string, framesPerRow = 1, framesPerColumn = 1, framesCount = framesPerRow * framesPerColumn ) {
    this.#sprite = new Image()
    this.#sprite.src = src

    this.#framesPerRow = framesPerRow
    this.#framesPerColumn = framesPerColumn
    this.#framesCount = framesCount

    this.#sprite.addEventListener( `load`, () => {
      this.#frameWidth = this.#sprite.width / this.#framesPerRow
      this.#frameheight = this.#sprite.height / this.#framesPerColumn
      this.#currentFrame = 0
    } )
  }


  nextFrame() {
    if (this.#currentFrame < this.#framesCount - 1) this.#currentFrame++
    else this.#currentFrame = 0
  }


  draw( ctx:CanvasRenderingContext2D, x:number, y:number, width?:number, height?:number ) {
    const sprite = this.#sprite
    const frameW = this.#frameWidth
    const frameH = this.#frameheight
    const frameX = this.#currentFrame % this.#framesPerRow * frameW
    const frameY = Math.floor( this.#currentFrame / this.#framesPerRow ) * frameH

    if (!width) width = sprite.width
    if (!height) height = sprite.height

    ctx.drawImage(
      sprite,
      frameX, frameY, frameW, frameH,
      x, y, width, height,
    )
  }
}
