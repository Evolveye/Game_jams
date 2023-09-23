import { GameColors } from "./types"
import Level from "./level"
import Game from "./controller"
import KeysController from "./KeysController"

export type GameConfig = {
  colors: GameColors
}

export default class CactuJam12Game extends Game {
  keys = new KeysController()

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
    const { keys, level } = this

    if (!level) return

    if (keys.isPressedOnce( `w` )) level.movePlayerBy( 0, 1 )
    if (keys.isPressedOnce( `s` )) level.movePlayerBy( 0, -1 )
    if (keys.isPressedOnce( `a` )) level.movePlayerBy( -1, 0 )
    if (keys.isPressedOnce( `d` )) level.movePlayerBy( 1, 0 )
  }
}
