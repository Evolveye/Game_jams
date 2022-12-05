export const events = [ `status update` ] as const
export type Event = (typeof events)[number]

export default abstract class Game<TStatus extends string> {
  #eventsHandlers = events.reduce( (obj, eventName) => ({ ...obj, [ eventName ]:[] }), {} ) as Record<Event, ((...data:any[]) => void)[]>
  #loopId: number = -1

  ticks = 0
  paused: boolean = false
  preGameUI: HTMLElement
  state: TStatus

  constructor( preGameUI:HTMLElement, initialState:TStatus ) {
    this.state = initialState
    this.preGameUI = preGameUI

    queueMicrotask( () => this.onResize() )
  }

  getUI = (selector:string) => {
    const element:null | HTMLElement = this.preGameUI.querySelector( selector )

    if (!element) throw new Error( `No UI element (${selector})found in pre-game HTML` )

    return element
  }

  getCtxFromCanvas = (selector:string) => {
    const canvas:null | HTMLCanvasElement = this.preGameUI.querySelector( selector )

    if (!canvas) throw new Error( `No canvas` )

    const ctx = canvas.getContext( `2d` )

    if (!ctx) throw new Error( `No context` )

    return ctx
  }

  changeStatus = (newStatus:TStatus) => {
    this.state = newStatus
    this.triggerEvent( `status update`, newStatus )
  }

  startLoop = () => {
    this.#loopId = setInterval( () => {
      if (this.paused) return

      requestAnimationFrame( () => this.draw() )
      this.calculate()
      this.ticks++
    }, 1000 / 60 ) as any as number
  }

  stopLoop = () => {
    clearInterval( this.#loopId )
  }

  pauseLoop = () => {
    this.paused = true
  }

  resumeLoop = () => {
    this.paused = false
  }

  on = (eventName:Event, handler:(...data:any[]) => void) => {
    this.#eventsHandlers[ eventName ].push( handler )
  }

  triggerEvent = (eventname:Event, ...data) => {
    this.#eventsHandlers[ eventname ].forEach( fn => fn( ...data ) )
  }

  setEvents = () => {
    window.addEventListener( `resize`, this.#onResize )
  }

  disable = () => {
    window.removeEventListener( `resize`, this.#onResize )
    this.stopLoop()
  }

  #onResize = () => {
    this.onResize()
  }

  abstract draw()
  abstract calculate()
  abstract onResize()
}
