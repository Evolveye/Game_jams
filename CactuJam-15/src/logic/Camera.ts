import { Rect, type Point } from "./shapes"

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

  followSlowly( target:Point, lerpFactor = 0.02 ) {
    const idealX = target.x - this.width / 2
    const idealY = target.y - this.height / 2

    const clampedTargetX = Math.max( 0, Math.min( this.#worldWidth - this.width, idealX ) )
    const clampedTargetY = Math.max( 0, Math.min( this.#worldHeight - this.height, idealY ) )

    this.x += (clampedTargetX - this.x) * lerpFactor
    this.y += (clampedTargetY - this.y) * lerpFactor

    if (Math.abs( this.x - clampedTargetX ) < 0.1) this.x = clampedTargetX
    if (Math.abs( this.y - clampedTargetY ) < 0.1) this.y = clampedTargetY
  }

  apply( ctx:CanvasRenderingContext2D ) {
    ctx.translate(
      Math.floor( -this.x ),
      Math.floor( -this.y ),
    )
  }

  intersects( rect:Rect ) {
    return Rect.intersects( this, rect )
  }
}
