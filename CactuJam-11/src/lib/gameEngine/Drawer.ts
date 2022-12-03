export default class Drawer {
  ctx: CanvasRenderingContext2D

  constructor( canvas:HTMLCanvasElement ) {
    const ctx = canvas.getContext( `2d` )

    if (!ctx) throw new Error( `No 2d ctx` )

    this.ctx = ctx
  }

  clear = () => {
    const { ctx } = this
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
  }

  start = () => {

  }
}
