import LevelCell from "@lib/gameEngine/logic/Level/LevelCell"
import Level from "@lib/gameEngine/logic/Level"
import { Game, Keys } from "@lib/gameEngine"
import { level01 } from "./level/01"
import { templates } from "./level"
import GameStatus, { type GameStatus as GameStatusType } from "./Status"

export default class CactuJam11Game extends Game<GameStatusType> {
  distance = 0
  ctx: CanvasRenderingContext2D
  keys = new Keys()
  level: null | Level<CactuJam11Game> = null
  startCeilsCount = 10
  minCeilsCount = 5
  maxCeilsCount = 20
  ticksToNewRow = Math.floor( 1000 / 30 )
  translate = {
    x: 0,
    y: 0,
    offset: {
      x: 0,
      y: 0,
    },
  }

  constructor( preGameUI:HTMLElement ) {
    super( preGameUI, GameStatus.NOT_STARTED )

    this.ctx = this.getCtxFromCanvas( `[data-canvas-main]` )
    this.start()
  }

  draw = () => {
    const { ctx, level, ticksToNewRow, ticks, translate } = this

    // if (ticks > 200) return
    if (!level) return

    const { width, height } = ctx.canvas

    ctx.clearRect( 0, 0, width, height )
    ctx.save()

    if (!level.data) return

    translate.x = width / 2 - (ticks / ticksToNewRow) * (level.tileSize)
    translate.y = (ticks / ticksToNewRow) * (level.tileSize / 2 - 10)

    ctx.translate(
      // -level.tileSize * 10,
      translate.x,
      // 0, // + ticks * level.tileSize / (1000 / 60),
      // (width  - level.width  * level.tileSize) / 2, // - level.tileSize * 20,
      // level.tileSize * 10,
      translate.y - translate.offset.y,
    )
    level.draw( ctx, translate )
    ctx.restore()
  }

  calculate = () => {
    const { ticks, level, startCeilsCount, minCeilsCount, maxCeilsCount, distance, translate, ticksToNewRow } = this

    if (!level) return

    const { height } = this.ctx.canvas
    const { data, tileSize } = level


    if (!data) return
    // if (ticks > 200) return

    const firstCell = data[ 0 ]?.[ 0 ].tiles[ 0 ]
    const correctedTileSize = tileSize / 2 - 10

    // const y1 = firstCell?.y * correctedTileSize
    // const y2 = -translate.y
    // if (y1 < y2) return
    if (ticks % ticksToNewRow) return

    // console.log( data.length, height / (tileSize / 2) )
    // console.log( -translate.x / tileSize + 10 )

    // console.log( firstCell?.x, ticks * 3 / level.tileSize, distance )
    // if (!data) return

    this.distance++

    // if (distance > 50) return

    const rows = 10
    const padding = Math.floor( Math.random() * 3 )

    data.unshift( Array.from(
      { length:startCeilsCount + rows },
      (_, i) => new LevelCell(
        i,
        distance,
        [ templates[ Math.random() > 0.2 ? `grassBlock` : `roadBlock` ].createTile( i + padding + distance, -distance, 0, 1 ) ],
      ),
    ) )

    if (data.length > (height + translate.offset.y * 2) / correctedTileSize) data.splice( -4 )

    // if (data.length > 50) for (let i = 6;  i > 0;  --i) data.pop()

    // this.startCeilsCount += Math.random() > 0.5 ? 1 : -1


    // if (this.startCeilsCount > maxCeilsCount) this.startCeilsCount = maxCeilsCount
    // else if (this.startCeilsCount < minCeilsCount) this.startCeilsCount = minCeilsCount

    // for (let i = 0;  i < rows;  ++i) {
    //   if (i % 2) data[ i ]?.shift()
    // }

    // if (data.length > rows / 2) for (let i = Math.floor( rows / 2 );  i < data.length;  ++i) {
    //   if (data[ i ].length) {
    //     const index = data[ i ].findIndex( c => c.tiles.length )

    //     if (index === -1) data.pop()
    //     else {
    //       const cell = data[ i ][ index ]

    //       if (cell) cell.tiles = []
    //     }
    //   } else data.pop()
    // }
  }

  start = () => {
    this.level = level01
    this.level.init( this )
    this.translate.offset.y = this.level.tileSize * 2
    this.changeStatus( GameStatus.STARTED )
    this.startLoop()
  }

  onResize = () => {
    const { canvas } = this.ctx

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    this.ctx.imageSmoothingEnabled = false
  }
}
