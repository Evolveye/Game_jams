import Painter from "./Painter"

import level1 from "./levels/1"
import Keys from "./Keys"

export default class Game {
  #painter:Painter
  #mainLoopAnimationId:number
  #framesIntervalId:number

  #keys = new Keys()
  #lastTick = performance.now()
  #lastRender = this.#lastTick
  #tickLength = 50

  level = level1


  constructor( canvas:HTMLCanvasElement ) {
    this.#painter = new Painter(canvas)

    this.startLoop()
  }


  #loop = (tFrame = performance.now()) => {
    this.#mainLoopAnimationId = window?.requestAnimationFrame( this.#loop )

    const lastTick = this.#lastTick
    const tickLength = this.#tickLength

    const nextTick = lastTick + tickLength
    let numTicks = 0

    if (tFrame > nextTick) {
      const timeSinceTick = tFrame - lastTick
      numTicks = Math.floor( timeSinceTick / tickLength )
    }

    for (var i = 0;  i < numTicks;  i++) {
      this.#lastTick += tickLength
      this.updateLogic( this.#lastTick )
    }

    this.render()
  }


  startLoop = () => {
    this.#mainLoopAnimationId = window?.requestAnimationFrame( this.#loop )
  }


  stopLoop = () => {
    window?.cancelAnimationFrame( this.#mainLoopAnimationId )
    window?.clearInterval( this.#framesIntervalId )
  }


  updateLogic = tFrame => {
    const entities = this.level.getEntities()

    entities.forEach( e => e.tick( tFrame ) )
  }


  render = () => {
    this.#painter.drawLevel( this.level )
  }


  close = () => {
    this.stopLoop()
    this.#painter.destroy()
  }
}
