import { GameColors } from "./types"
import Level from "./level"
import Game from "./controller"

export type GameConfig = {
  colors: GameColors
}

export default class CactuJam12Game extends Game {
  level: null | Level = null
  ctx: CanvasRenderingContext2D
  colors: GameColors

  constructor( div:HTMLDivElement, { colors }:GameConfig ) {
    super( div )

    this.colors = colors

    this.ctx = this.registerCtx( `main`, `canvas` )

    this.runLevel( 1 )
    this.startLoop()
  }

  runLevel( id:number ) {
    if (id === 1) {
      this.level = new Level( this.colors )
    }
  }

  draw() {
    this.level?.draw( this.ctx )
  }

  logic() {
    throw new Error( `Method not implemented.` )
  }
}
