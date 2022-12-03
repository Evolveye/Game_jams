import { Game } from "@lib/gameEngine"
import GameStatus, { type GameStatus as GameStatusType } from "./Status"

export default class CactuJam11Game extends Game<GameStatusType> {
  ctx: CanvasRenderingContext2D

  constructor( preGameUI:HTMLElement ) {
    super( preGameUI, GameStatus.NOT_STARTED )

    this.ctx = this.getCtxFromCanvas( `[data-canvas-main]` )
  }

  draw = () => {

  }

  calculate = () => {

  }
}
