export const events = [ `status update` ] as const
export type Event = (typeof events)[number]

export default abstract class Game<TStatus extends string> {
  #eventsHandlers = events.reduce( (obj, eventName) => ({ ...obj, [ eventName ]:[] }), {} ) as Record<Event, ((...data:any[]) => void)[]>

  preGameUI: HTMLElement
  state: TStatus

  constructor( preGameUI:HTMLElement, initialState:TStatus ) {
    this.state = initialState
    this.preGameUI = preGameUI
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
    this.#eventsHandlers[ `status update` ].forEach( fn => fn( newStatus ) )
  }

  on = (eventName:Event, handler:() => void) => {
    this.#eventsHandlers[ eventName ].push( handler )
  }

  abstract draw()
  abstract calculate()
}
