export type LoopCallbackData = {
  timeDelta: number
  fps: number
}
export type LoopCallback = (timestamp:number, data:LoopCallbackData) => void

export default class GameLoop {
  #targetFps = 60
  #loopId: null | number = -1
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

    const frameInterval = 1000 / this.#targetFps
    let loopOldTimestamp = performance.now()

    // let temp = 0

    const loop = (timestamp:number) => {
      const timeDelta = timestamp - loopOldTimestamp
      const fps = Math.round( 1 / timeDelta * 1000 )
      const timeMultiplier = timeDelta / frameInterval

      loopOldTimestamp = timestamp

      this.#loopId = window.requestAnimationFrame( loop )
      if (timeMultiplier > 0) loopCb( timeMultiplier, { timeDelta, fps } )
    }

    loop( performance.now() )
  }
}
