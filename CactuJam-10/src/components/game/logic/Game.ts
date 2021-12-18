import Drawable from "./Drawable"
import Painter from "./Painter"
import TiledLevel from "./TiledLevel"

export default class Game {
  #ctx:CanvasRenderingContext2D
  #painter:Painter
  #loopIntervalId:number
  #framesIntervalId:number


  constructor( canvas:HTMLCanvasElement, imagesSrcs:Record<string, string> ) {
    this.#painter = new Painter(canvas)

    const background = new Drawable( imagesSrcs.pacman, 2, 3 )
    const level = new TiledLevel( 1, 1 )

    level.putOnCell( 0, 0, background )

    this.#loopIntervalId = window?.setInterval( () => {
      this.#painter.drawLevel( level )
    }, 1000 / 60 )

    this.#framesIntervalId = window?.setInterval( () => {
      level.entities.forEach( e => e.nextFrame() )
    }, 500 )
  }


  close = () => {
    window?.clearInterval( this.#loopIntervalId )
    window?.clearInterval( this.#framesIntervalId )

    this.#painter.destroy()
  }
}
