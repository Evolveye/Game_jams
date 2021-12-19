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
    const ctx = this.#ctx

    this.clear()

    ctx.save()

    if (mode === Mode.CENTER) {
      ctx.translate( (ctx.canvas.width - level.width) / 2, (ctx.canvas.height - level.height) / 2 )
    }

    level.forEach( (cell, x, y) => {
      cell.forEach( tile => {
        if (!tile) return

        tile?.draw( ctx, x * tileSize, y * tileSize, tile.w * tileSize, tile.h * tileSize )
      } )
    } )

    level.entities.forEach( e => e.draw( ctx, e.x * tileSize, e.y * tileSize, tileSize, tileSize ) )

    ctx.restore()
  }


  destroy = () => {
    window?.removeEventListener( `resize`, this.#resize )
  }
}
