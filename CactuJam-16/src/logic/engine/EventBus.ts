export type Listener<Payload> = (payload:Payload) => void

/** Emit arguments: none for `void` events, otherwise the payload. */
type PayloadArgs<Payload> = [ Payload ] extends [ void ] ? [] : [ payload:Payload ]


export default class EventBus<Events extends Record<string, unknown>> {
  #listeners = new Map<keyof Events, Set<Listener<unknown>>>()

  on<Name extends keyof Events>( name:Name, listener:Listener<Events[ Name ]>, signal?:AbortSignal ) {
    if (signal?.aborted) return () => {}

    const listeners = this.#listeners.get( name ) ?? new Set()
    const genericListener = listener as Listener<unknown>

    listeners.add( genericListener )
    this.#listeners.set( name, listeners )

    const off = () => listeners.delete( genericListener )
    signal?.addEventListener( `abort`, off, { once:true } )

    return off
  }

  once<Name extends keyof Events>( name:Name, signal?:AbortSignal, predicate?:(payload:Events[ Name ]) => boolean ) {
    return new Promise<Events[ Name ]>( resolve => {
      const off = this.on( name, payload => {
        if (predicate && !predicate( payload )) return

        off()
        resolve( payload )
      }, signal )
    } )
  }

  emit<Name extends keyof Events>( name:Name, ...[ payload ]:PayloadArgs<Events[ Name ]> ) {
    const listeners = this.#listeners.get( name )
    if (!listeners) return

    for (const listener of [ ...listeners ]) listener( payload )
  }

  clear() {
    this.#listeners.clear()
  }
}
