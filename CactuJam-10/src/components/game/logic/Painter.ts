import TiledLevel from "./TiledLevel"

export enum Mode {
  CENTER = `center`,
}

export type DrawLevelOptions = {
  mode?: Mode
  tileSize?: number
}

export default class Painter {
  static Mode = Mode


  #ctx:CanvasRenderingContext2D


  constructor( canvas:HTMLCanvasElement ) {
    this.#ctx = canvas.getContext( `2d` )

    this.#resize()
    window?.addEventListener( `resize`, this.#resize )
  }


  #resize = () => {
    const { canvas } = this.#ctx

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  }


  clear() {
    const { width, height } = this.#ctx.canvas

    this.#ctx.clearRect( 0, 0, width, height )
  }


  drawLevel( level:TiledLevel, { mode = Mode.CENTER, tileSize = 32 }:DrawLevelOptions = {} ) {
    this.clear()

    const ctx = this.#ctx

    const additionalX = mode === Mode.CENTER ? (ctx.canvas.width - level.width) / 2 : 0
    const additionalY = mode === Mode.CENTER ? (ctx.canvas.height - level.height) / 2 : 0

    level.forEach( (cell, x, y) => {
      cell.forEach( drawableItem => {
        if (!drawableItem) return

        drawableItem?.draw( ctx, additionalX + x * tileSize, additionalY + y * tileSize, tileSize, tileSize )
      } )
    } )

    level.entities.forEach( e => e.draw( ctx, additionalX + e.x * tileSize, additionalY + e.y * tileSize, tileSize, tileSize ) )
  }


  destroy = () => {
    window?.removeEventListener( `resize`, this.#resize )
  }
}
