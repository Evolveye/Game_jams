import { type Point } from "./shapes"

export default class Camera {
  x: number = 0
  y: number = 0
  #worldWidth: number
  #worldHeight: number

  constructor(
    public width:number,
    public height:number,
    worldWidth:number,
    worldHeight:number,
  ) {
    this.#worldWidth = worldWidth
    this.#worldHeight = worldHeight
  }

  follow( target:Point ) {
    const targetX = target.x - this.width / 2
    const targetY = target.y - this.height / 2

    this.x = Math.max( 0, Math.min( this.#worldWidth - this.width, targetX ) )
    this.y = Math.max( 0, Math.min( this.#worldHeight - this.height, targetY ) )
  }

  apply( ctx:CanvasRenderingContext2D ) {
    ctx.translate( -this.x, -this.y )
  }
}
