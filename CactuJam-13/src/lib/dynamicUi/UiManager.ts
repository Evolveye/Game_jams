import { useCallback, useReducer, useRef, useState } from "react"
import { Primitive } from "../core/types"

export type UiData = { [k:string]:Primitive | UiData }
export type UiUpdater<T extends UiData = UiData> = (data:T) => void
export type LoopCallback = (timestamp:number, fps:number) => void
export type TimerInfo = {
  type: `timeout` | `interval`
  id: number
}

type RegisteredEvent = {
  element: Window | HTMLElement
  eventname: string
  handler: (e:any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default class UiManager<TEle extends HTMLElement> {
  #loopId: null | number = -1
  #loopCb: null | LoopCallback = null
  #registeredEvents = new Set<RegisteredEvent>()
  #registeredIntervals = new Set<TimerInfo>()
  #uiUpdater: null | UiUpdater = null
  #targetFps = 60

  ctxs = new Map<string, CanvasRenderingContext2D>()
  rootElement: TEle

  constructor( rootElement:TEle ) {
    this.rootElement = rootElement
  }

  setUIUpdater( updater:(data:UiData) => void ) {
    this.#uiUpdater = updater
  }

  updateUi( uiData:UiData ) {
    if (this.#uiUpdater) this.#uiUpdater( structuredClone( uiData ) )
  }

  registerTimer( type:TimerInfo[`type`], ms:number, cb:() => void ) {
    this.#registeredIntervals.add({
      type,
      id: type === `interval` ? window.setInterval( cb, ms ) : window.setTimeout( cb, ms ),
    })
  }

  registerEvent<TEv extends keyof HTMLElementEventMap>(element:Window | HTMLElement, eventname:TEv, handler:(e:HTMLElementEventMap[TEv]) => void) {
    this.#registeredEvents.add({ element, eventname, handler })
    element.addEventListener( eventname, handler as EventListener )
  }

  registerCtx( name:string, canvasSelector:string | HTMLCanvasElement ) {
    const maybeCanvas:null | HTMLCanvasElement = typeof canvasSelector !== `string` ? canvasSelector : this.rootElement.querySelector( canvasSelector )
    const ctx = maybeCanvas?.getContext( `2d` )

    if (typeof canvasSelector === `string` && !maybeCanvas) throw new Error( `Canvas "${name}" not found with provided selector: "${canvasSelector}"` )
    if (!ctx) throw new Error( `Cannot create 2D context for "${name}" canvas` )

    const resizeHandler = () => {
      ctx.canvas.width = ctx.canvas.clientWidth * window.devicePixelRatio
      ctx.canvas.height = ctx.canvas.clientHeight * window.devicePixelRatio
      ctx.imageSmoothingEnabled = false
    }

    this.ctxs.set( name, ctx )
    this.registerEvent( window, `resize`, resizeHandler )
    resizeHandler()

    return ctx
  }

  startLoop( cb:LoopCallback ) {
    this.pauseLoop()
    this.#loopCb = cb
    this.resumeLoop()
  }

  pauseLoop() {
    if (this.#loopId) window.cancelAnimationFrame( this.#loopId )
    this.#loopId = null
  }

  resumeLoop() {
    const loopCb = this.#loopCb

    if (!loopCb || this.#loopId) return

    const frameInterval = 1000 / this.#targetFps
    let loopOldTimestamp = performance.now()

    // let temp = 0

    const loop = (timestamp:number) => {
      const timeDelta = timestamp - loopOldTimestamp
      const fps = Math.round( 1 / timeDelta * 1000 )
      const timeMultiplier = timeDelta / frameInterval

      loopOldTimestamp = timestamp

      this.#loopId = window.requestAnimationFrame( loop )
      // if (temp++ % 10 === 0) console.log( timeMultiplier, this.#loopCb )
      if (timeMultiplier > 0) loopCb( timeMultiplier, fps )
    }

    loop( performance.now() )
  }

  dispose() {
    console.log( `dispose` )
    this.pauseLoop()
    this.#registeredEvents.forEach( data => {
      data.element.removeEventListener( data.eventname, data.handler )
    } )
    this.#registeredIntervals.forEach( timer => {
      if (timer.type === `interval`) window.clearInterval( timer.id )
      else window.clearTimeout( timer.id )
    } )
  }
}

export interface UiManagerHolder {
  uiManager: UiManager<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  uiData: UiData
}

export function useUiManager<TRoot extends HTMLElement, THolder extends UiManagerHolder>( handler:(ref:TRoot) => THolder, assignToWindow = false ) {
  const managerHolderRef = useRef<null | THolder>(null)
  const [ updateCount, setUpdateCount ] = useState( 0 )
  const [ , dispatchData ] = useReducer( (_:THolder[`uiData`], b:THolder[`uiData`]) => b, {} )

  const handleRef = useCallback( (ref:TRoot | null) => {
    if (ref) {
      managerHolderRef.current = handler( ref )
      managerHolderRef.current?.uiManager.setUIUpdater( data => dispatchData( data ) )
      if (assignToWindow) (window as unknown as { game:THolder }).game = managerHolderRef.current
      setUpdateCount( c => c + 1 )
    } else {
      managerHolderRef.current?.uiManager.dispose()
      managerHolderRef.current = null
      if (assignToWindow) (window as unknown as { game:undefined }).game = undefined
    }
  }, [] ) // eslint-disable-line react-hooks/exhaustive-deps

  return [ handleRef, managerHolderRef.current, updateCount ] as const
}
