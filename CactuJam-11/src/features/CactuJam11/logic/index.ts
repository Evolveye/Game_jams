import Level from "@lib/gameEngine/logic/Level"
import { Game, Keys } from "@lib/gameEngine"
import { level01 } from "./level/01"
import GameStatus, { type GameStatus as GameStatusType } from "./Status"

export default class CactuJam11Game extends Game<GameStatusType> {
  ctx: CanvasRenderingContext2D
  keys = new Keys()
  level: null | Level<CactuJam11Game> = null

  constructor( preGameUI:HTMLElement ) {
    super( preGameUI, GameStatus.NOT_STARTED )

    this.ctx = this.getCtxFromCanvas( `[data-canvas-main]` )
    // this.start()
  }

  draw = () => {
    const { ctx, level } = this

    if (!level) return

    const { width, height } = ctx.canvas

    ctx.save()
    ctx.translate(
      (width  - level.width  * level.tileSize) / 2,
      (height - level.height * level.tileSize) / 2,
    )
    level.draw( this.ctx )
    ctx.restore()
  }

  calculate = () => {
    console.log( `draw`, this.state )
  }

  start = () => {
    this.level = level01
    this.level.init( this )
    this.changeStatus( GameStatus.STARTED )
    this.startLoop()
  }

  onResize = () => {
    const { canvas } = this.ctx

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}
