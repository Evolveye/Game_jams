import Level from "./Level"

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


  drawLevel( level:Level, { mode = Mode.CENTER, tileSize = 32 }:DrawLevelOptions = {} ) {
    const ctx = this.#ctx

    this.clear()

    ctx.save()

    if (mode === Mode.CENTER) {
      ctx.translate( (ctx.canvas.width - level.width * tileSize) / 2, (ctx.canvas.height - level.height * tileSize) / 2 )
    }

    level.forEach( cell => cell.forEach( tile => tile?.draw( ctx, tileSize ) ) )
    level.entities.forEach( e => e.draw( ctx, tileSize ) )

    ctx.restore()
  }


  destroy = () => {
    window?.removeEventListener( `resize`, this.#resize )
  }
}
