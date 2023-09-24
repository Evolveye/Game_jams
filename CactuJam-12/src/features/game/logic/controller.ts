import { useCallback, useEffect, useReducer, useRef } from "react"
import { Primitive } from "@lib/theming/types"

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

export default abstract class Game<TEle extends HTMLElement = HTMLElement> {
  #loopId: number = -1
  #uiUpdater: null | ((data:typeof this.uiData) => void) = null
  ctxs = new Map<string, CanvasRenderingContext2D>()
  root: TEle

  abstract uiData: Record<string, Primitive>

  constructor( root:TEle ) {
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
      this.logic()
      this.draw()

      // this.#loopId = window.setTimeout( loop, 1000 )
      this.#loopId = window.setTimeout( loop, 1000 / 60 )
    } )

    loop()
  }

  stopLoop() {
    window.clearTimeout( this.#loopId )
  }

  setUIUpdater( updater:(data:typeof this.uiData) => void ) {
    this.#uiUpdater = updater
  }

  updateUi() {
    // console.log( this.uiData )
    if (this.#uiUpdater) this.#uiUpdater( structuredClone( this.uiData ) )
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

    return ctx
  }

  abstract draw(): void
  abstract logic(): void
}

export function useGame<
  Ctrl extends Game<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  Ele extends HTMLElement = HTMLDivElement,
>( handler:(ref:Ele) => Ctrl ): [(ref:Ele) => void, Ctrl["uiData"], null | Ctrl] {
  const controllerRef = useRef<null | Ctrl>(null)
  const [ data, dispatchData ] = useReducer( (_:Ctrl["uiData"], b:Ctrl["uiData"]) => b, {} )

  useEffect( () => {
    controllerRef.current
  }, [] )

  const handleRef = useCallback( (ref:Ele) => {
    // console.log({ ref })
    if (ref) {
      controllerRef.current = handler( ref )
      controllerRef.current?.setUIUpdater( data => {
        // console.log( data )
        dispatchData( data )
      } )
    } else {
      controllerRef.current?.disable()
      controllerRef.current = null
    }
  }, [] )

  return [ handleRef, data, controllerRef.current ]
}
