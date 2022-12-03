import Level from "@lib/gameEngine/logic/Level"
import { Game, Keys } from "@lib/gameEngine"
import { levels } from "./level"
import GameStatus, { type GameStatus as GameStatusType } from "./Status"

export default class CactuJam11Game extends Game<GameStatusType> {
  ctx: CanvasRenderingContext2D
  keys = new Keys()
  level: Level

  constructor( preGameUI:HTMLElement ) {
    super( preGameUI, GameStatus.NOT_STARTED )

    this.ctx = this.getCtxFromCanvas( `[data-canvas-main]` )
    this.level = levels.island
    this.draw()
  }

  draw = () => {
    const { ctx, level } = this
    const { width, height } = ctx.canvas

    ctx.save()
    ctx.translate( width / 2 - level.tileSize / 2, height / 2 - level.tileSize / 2 )
    level.draw( this.ctx )
    ctx.restore()
  }

  calculate = () => {

  }
}
