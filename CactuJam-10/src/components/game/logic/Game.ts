import Painter from "./Painter"

import level1 from "./levels/1"
import Keys from "./Keys"
import Level from "./Level"
import Entity from "./Entity"
import getWindow from "../../../core/functions/getWindow"

export default class Game {
  #mainLoopAnimationId:number
  #framesIntervalId:number

  #painter = new Painter()
  #keys = new Keys()
  #lastTick = performance.now()
  #lastRender = this.#lastTick
  #tickLength = 50

  activeEntity:Entity
  level:Level


  constructor() {
    this.startLevel()
    this.startLoop()
  }

  setCanvas = (canvas:HTMLCanvasElement, layer = 0) => {
    this.#painter.setCanvas( canvas, layer )
  }


  #loop = (timestamp = 0) => {
    this.#mainLoopAnimationId = getWindow()?.requestAnimationFrame( this.#loop )

    const lastTick = this.#lastTick
    const tickLength = this.#tickLength

    const nextTick = lastTick + tickLength
    let numTicks = 0

    if (timestamp > nextTick) {
      const timeSinceTick = timestamp - lastTick
      numTicks = Math.floor( timeSinceTick / tickLength )
    }

    for (var i = 0;  i < numTicks;  i++) {
      this.#lastTick += tickLength
      this.updateLogic( 1 - Math.floor( (timestamp - this.#lastTick) / 1000 ) )
    }

    this.render()
  }


  startLevel = () => {
    this.level = level1
    this.level.setGame( this )
    this.level.runScript()
  }


  setActiveEntity = (entity:Entity) => {
    this.activeEntity = entity
  }


  startLoop = () => {
    this.#mainLoopAnimationId = getWindow()?.requestAnimationFrame( this.#loop )
  }


  stopLoop = () => {
    getWindow()?.cancelAnimationFrame( this.#mainLoopAnimationId )
    getWindow()?.clearInterval( this.#framesIntervalId )
  }


  updateLogic = delta => {
    if (!this.level) return

    const entities = this.level.getEntities()

    entities.forEach( e => e.tick( delta ) )
  }


  render = () => {
    if (!this.level) return

    this.#painter.drawLevel( this.level )
  }


  close = () => {
    this.stopLoop()
    this.#painter.destroy()
  }
}
