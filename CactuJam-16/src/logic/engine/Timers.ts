type Timer = { remaining:number, resolve:() => void }

/** Game-time timers. They only advance when `update()` is called, so pausing the game pauses them too. */
export default class Timers {
  #timers = new Set<Timer>()

  wait( seconds:number, signal?:AbortSignal ) {
    return new Promise<void>( resolve => {
      if (signal?.aborted) return

      const timer = { remaining:seconds, resolve }

      this.#timers.add( timer )
      signal?.addEventListener( `abort`, () => this.#timers.delete( timer ), { once:true } )
    } )
  }

  update( seconds:number ) {
    for (const timer of [ ...this.#timers ]) {
      timer.remaining -= seconds
      if (timer.remaining > 0) continue

      this.#timers.delete( timer )
      timer.resolve()
    }
  }

  clear() {
    this.#timers.clear()
  }
}
