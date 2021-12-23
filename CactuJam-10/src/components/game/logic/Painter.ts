import getWindow from "../../../core/functions/getWindow"
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


  #ctxs:CanvasRenderingContext2D[] = []
  #entitiesCtx:CanvasRenderingContext2D


  constructor() {
    getWindow()?.addEventListener( `resize`, this.#resize )
  }


  setCanvas = (canvas:HTMLCanvasElement, layer = 0) => {
    this.#ctxs[ layer ] = canvas.getContext( `2d` )

    this.#resize()
  }


  #getEntitiesCtx = () => this.#ctxs[ this.#ctxs.length - 1 ]
  #getBestCtx = layer => this.#ctxs.length > layer ? this.#ctxs[ layer ] : this.#ctxs[ this.#ctxs.length - 1 ]



  #resize = () => {
    this.#ctxs.forEach( ctx => {
      const { canvas } = ctx

      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    } )
  }


  clear( ctx:CanvasRenderingContext2D = null ) {
    const clearer = ctx => {
      const { width, height } = ctx.canvas

      ctx.clearRect( 0, 0, width, height )
    }

    if (ctx) clearer( ctx )
    else this.#ctxs.forEach( clearer )
  }


  drawLevel( level:Level, { mode = Mode.CENTER, tileSize = 32 }:DrawLevelOptions = {} ) {
    const ctxs = this.#ctxs
    const eCtx = this.#getEntitiesCtx()

    this.clear()

    ctxs.forEach( ctx => {
      ctx.save()

      if (mode === Mode.CENTER) {
        ctx.translate( (ctx.canvas.width - level.width * tileSize) / 2, (ctx.canvas.height - level.height * tileSize) / 2 )
      }
    } )

    level.forEach( cell => cell.forEach( (tile, layer) => tile?.draw( this.#getBestCtx( layer ), tileSize ) ) )
    level.entities.forEach( e => e.draw( eCtx, tileSize ) )

    ctxs.forEach( ctx => ctx.restore() )
  }


  destroy = () => {
    getWindow()?.removeEventListener( `resize`, this.#resize )
  }
}
