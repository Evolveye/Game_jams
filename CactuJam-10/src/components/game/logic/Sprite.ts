export default class Sprite {
  #framesCount:number
  #framesPerRow:number
  #framesPerColumn:number
  #spreadsheet:HTMLImageElement
  #currentFrame:number = 0
  #frameWidth:number
  #frameheight:number


  constructor( src:string, framesPerRow = 1, framesPerColumn = 1, framesCount = framesPerRow * framesPerColumn ) {
    this.#spreadsheet = new Image()
    this.#spreadsheet.src = src

    this.#framesPerRow = framesPerRow
    this.#framesPerColumn = framesPerColumn
    this.#framesCount = framesCount

    this.#spreadsheet.addEventListener( `load`, () => {
      this.#frameWidth = this.#spreadsheet.width / this.#framesPerRow
      this.#frameheight = this.#spreadsheet.height / this.#framesPerColumn
      this.#currentFrame = 0
    } )
  }


  nextFrame = () => {
    if (this.#currentFrame < this.#framesCount - 1) this.#currentFrame++
    else this.#currentFrame = 0
  }


  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, width?:number, height?:number) => {
    const sprite = this.#spreadsheet
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
