import type Sprite from "."

export default class Animation {
  #currentFrame: number = 0
  sprite: Sprite

  constructor( sprite:Sprite ) {
    this.sprite = sprite
  }

  nextFrame = () => {
    if (this.#currentFrame < this.sprite.framesCount - 1) this.#currentFrame++
    else this.#currentFrame = 0
  }

  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, width?:number, height?:number) => {
    const sprite = this.sprite.spreadsheet
    const frameW = this.sprite.frameWidth
    const frameH = this.sprite.frameheight
    const frameX = this.#currentFrame % this.sprite.framesPerRow * frameW
    const frameY = Math.floor( this.#currentFrame / this.sprite.framesPerRow ) * frameH

    if (!width) width = sprite.width
    if (!height) height = sprite.height

    ctx.drawImage(
      sprite,
      frameX, frameY, frameW, frameH,
      x, y, width, height,
    )
  }
}
