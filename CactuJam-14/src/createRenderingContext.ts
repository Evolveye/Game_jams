export default function createRenderingContext( selector:string ) {
  const canvas = document.querySelector( selector ) as null | HTMLCanvasElement
  if (!canvas) throw new Error( `Cannot query canvas with selector "${selector}"` )
  const ctx = canvas?.getContext( `2d` )
  if (!ctx) throw new Error( `Cannot create 2D context for canvas` )

  const resetCanvas = () => {
    ctx.canvas.width = ctx.canvas.clientWidth * window.devicePixelRatio
    ctx.canvas.height = ctx.canvas.clientHeight * window.devicePixelRatio
    ctx.imageSmoothingEnabled = false
  }

  canvas.addEventListener( `resize`, resetCanvas )
  resetCanvas()

  return { ctx, resetCanvas }
}
