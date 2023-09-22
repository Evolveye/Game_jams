import { useRef } from "react"

export class ElementShape<T extends HTMLElement> {
  element: T
  width: number
  height: number
  center: {
    x: number
    y: number
  }

  constructor( element:T ) {
    this.element = element
    this.width = element.clientWidth
    this.height = element.clientHeight
    this.center = {
      x: element.clientWidth / 2,
      y: element.clientHeight / 2,
    }
  }

  setDimensions( width:number, height:number ) {
    this.width = width
    this.height = height
    this.center = {
      x: width / 2,
      y: height / 2,
    }
  }
}

export default abstract class Game<T extends HTMLElement = HTMLDivElement> {
  #loopId: number = -1
  ctxs = new Map<string, CanvasRenderingContext2D>()
  root: T

  constructor( root:T ) {
    this.root = root
  }

  enable() {
    window.addEventListener( `resize`, this.#handleResize )
    this.#handleResize()
    this.startLoop()
  }

  disable() {
    window.removeEventListener( `resize`, this.#handleResize )
    this.stopLoop()
  }

  startLoop() {
    const loop = () => requestAnimationFrame( () => {
      this.draw()

      this.#loopId = window.setTimeout( loop, 1000 )
    } )

    loop()
  }

  stopLoop() {
    window.clearTimeout( this.#loopId )
  }

  #setupCanvas( canvas:HTMLCanvasElement ) {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  }

  #handleResize = () => {
    this.ctxs.forEach( ctx => this.#setupCanvas( ctx.canvas ) )
  }

  protected registerCtx( name:string, canvasSelector:string | HTMLCanvasElement ) {
    const maybeCanvas:null | HTMLCanvasElement = typeof canvasSelector !== `string` ? canvasSelector : this.root.querySelector( canvasSelector )
    const ctx = maybeCanvas?.getContext( `2d` )

    if (typeof canvasSelector === `string` && !maybeCanvas) throw new Error( `Canvas "${name}" not found with provided selector: "${canvasSelector}"` )
    if (!ctx) throw new Error( `Cannot create 2D context for "${name}" canvas` )

    this.ctxs.set( name, ctx )
    this.#setupCanvas( ctx.canvas )
  }

  abstract draw(): void
  abstract logic(): void
}

export function useGame<
  Ctrl extends Game<HTMLElement>,
  Ele extends HTMLElement = HTMLDivElement,
>( handler:(ref:Ele) => Ctrl ): [(ref:Ele) => void, null | Ctrl] {
  const controllerRef = useRef<null | Ctrl>(null)

  const handleRef = (ref:Ele) => {
    if (ref) controllerRef.current = handler( ref )
    else controllerRef.current?.disable()
  }

  return [ handleRef, controllerRef.current ]
}
