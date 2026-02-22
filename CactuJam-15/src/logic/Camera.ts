import { Rect, type Point } from "./shapes"

export default class Camera {
  x: number = 0
  y: number = 0
  zoom: number = 1
  #worldWidth: number
  #worldHeight: number
  cursorElement?: HTMLElement
  activePointers = {
    mouseRight: false,
    mouseLeft: false,
  }
  pointerPos = {
    inGame: {
      x: 0,
      y: 0,
    },
    x: 0,
    y: 0,
  }

  constructor(
    public width:number,
    public height:number,
    worldWidth:number,
    worldHeight:number,
    cursorElement?:HTMLElement,
  ) {
    this.#worldWidth = worldWidth
    this.#worldHeight = worldHeight
    this.cursorElement = cursorElement

    window.addEventListener( `mousemove`, ({ clientX, clientY }) => {
      this.pointerPos.inGame.x = this.x + (clientX / this.zoom)
      this.pointerPos.inGame.y = this.y + (clientY / this.zoom)
      this.pointerPos.x = clientX
      this.pointerPos.y = clientY

      if (cursorElement) requestAnimationFrame( () => {
        cursorElement.style.left = `${clientX}px`
        cursorElement.style.top = `${clientY}px`
      } )
    } )

    window.addEventListener( `pointerdown`, e => {
      if (e.target instanceof HTMLElement && e.target.tagName !== `CANVAS`) return

      switch (e.button) {
        case 0: this.activePointers.mouseLeft = true; break
        case 2: this.activePointers.mouseRight = true; break
      }
    } )
    window.addEventListener( `pointerup`, e => {
      switch (e.button) {
        case 0: this.activePointers.mouseLeft = false; break
        case 2: this.activePointers.mouseRight = false; break
      }
    } )
  }

  get visibleWidth() {
    return this.width / this.zoom
  }

  get visibleHeight() {
    return this.height / this.zoom
  }

  updateCursor( type:`default` | `action` ) {
    if (!this.cursorElement) return

    if (type === `default`) this.cursorElement.className = ``
    else if (!this.cursorElement.className.includes( type )) this.cursorElement.className = type
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
    const offset = 100
    const viewport = {
      x: this.x - offset,
      y: this.y - 100,
      width: this.visibleWidth + offset * 2,
      height: this.visibleHeight + offset * 2,
    }

    return Rect.intersects( viewport, rect )
  }
}
