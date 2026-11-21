export type LoopCallbackData = {
  iterationsCount: number
  timeDelta: number
  fps: number
}
export type LoopCallback = (timeMultiplier:number, data:LoopCallbackData) => void

export default class Loop {
  #referenceFps = 60
  #maxTimeDelta = 100
  #loopId: null | number = null
  #loopCb: null | LoopCallback = null

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

    const frameInterval = 1000 / this.#referenceFps
    let loopOldTimestamp = performance.now()
    let iterationsCount = 0

    const loop = (timestamp:number) => {
      const rawTimeDelta = timestamp - loopOldTimestamp
      const timeDelta = Math.min( rawTimeDelta, this.#maxTimeDelta )

      loopOldTimestamp = timestamp
      this.#loopId = window.requestAnimationFrame( loop )
      if (timeDelta <= 0) return

      iterationsCount++
      loopCb( timeDelta / frameInterval, { iterationsCount, timeDelta, fps:Math.round( 1000 / rawTimeDelta ) } )
    }

    this.#loopId = window.requestAnimationFrame( loop )
  }
}