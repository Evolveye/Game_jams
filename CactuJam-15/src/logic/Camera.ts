import { Rect, type Point } from "./shapes"

export default class Camera {
  x: number = 0
  y: number = 0
  zoom: number = 1
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

  get visibleWidth() {
    return this.width / this.zoom
  }

  get visibleHeight() {
    return this.height / this.zoom
  }

  follow( target:Point ) {
    const targetX = target.x - this.visibleWidth / 2
    const targetY = target.y - this.visibleHeight / 2

    this.x = Math.max( 0, Math.min( this.#worldWidth - this.visibleWidth, targetX ) )
    this.y = Math.max( 0, Math.min( this.#worldHeight - this.visibleHeight, targetY ) )
  }

  followSlowly( target:Point, lerpFactor = 0.02 ) {
    const idealX = target.x - this.visibleWidth / 2
    const idealY = target.y - this.visibleHeight / 2

    const clampedTargetX = Math.max( 0, Math.min( this.#worldWidth - this.visibleWidth, idealX ) )
    const clampedTargetY = Math.max( 0, Math.min( this.#worldHeight - this.visibleHeight, idealY ) )

    this.x += (clampedTargetX - this.x) * lerpFactor
    this.y += (clampedTargetY - this.y) * lerpFactor

    if (Math.abs( this.x - clampedTargetX ) < 0.1) this.x = clampedTargetX
    if (Math.abs( this.y - clampedTargetY ) < 0.1) this.y = clampedTargetY
  }

  apply( ctx:CanvasRenderingContext2D ) {
    ctx.translate( this.width / 2, this.height / 2 )

    ctx.scale( this.zoom, this.zoom )

    ctx.translate(
      -(this.x + this.visibleWidth / 2),
      -(this.y + this.visibleHeight / 2),
    )
  }

  intersects( rect:Rect ) {
    const viewport = {
      x: this.x,
      y: this.y,
      width: this.visibleWidth,
      height: this.visibleHeight,
    }

    return Rect.intersects( viewport, rect )
  }
}
