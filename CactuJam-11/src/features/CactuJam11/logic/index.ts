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

    // if (ticks > 300) return
    if (!level) return

    const { width, height } = ctx.canvas

    ctx.clearRect( 0, 0, width, height )
    ctx.save()

    if (!level.data) return

    translate.x = width / 2 - (ticks / ticksToNewRow) * (level.tileSize)
    translate.y = (ticks / ticksToNewRow) * (level.tileSize / 2 - 10)

    ctx.translate(
      // translate.x,
      translate.x - 250,
      // translate.y - translate.offset.y,
      translate.y - translate.offset.y + 500,
    )
    level.draw( ctx, translate )
    ctx.restore()
  }

  calculate = () => {
    const { ticks, level, translate, ticksToNewRow } = this

    if (!level) return

    const { height } = this.ctx.canvas
    const { data, tileSize } = level

    if (!data) return

    if (this.keys.isActiveOnce( `w` )) {
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y -= 1
        if (e.y % 2 == 0) e.x += 1
      } )
    } else if (this.keys.isActiveOnce( `a` )) {
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y -= 1
        if (e.y % 2 == -1) e.x -= 1
      } )
    } else if (this.keys.isActiveOnce( `s` )) {
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y += 1
        if (e.y % 2 == -1) e.x -= 1
      } )
    } else if (this.keys.isActiveOnce( `d` )) {
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y += 1
        if (e.y % 2 == 0) e.x += 1
      } )
    }

    let playerHasBeenRemoved = false
    level.getEntitiesOnWrongTile().forEach( e => {
      if (e.templateId === `p`) playerHasBeenRemoved = true

      level.removeEntity( e )
    } )

    if (playerHasBeenRemoved && level.getEntities( e => e.templateId === `p` ).length === 0) {
      this.stopLoop()
    }

    if (ticks % ticksToNewRow == 0) {
      const correctedTileSize = tileSize / 2 - 10

      this.distance++
      this.spawnRow()

      if (data.length > (height + translate.offset.y * 2) / correctedTileSize) level.prune( 4 )
    }


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
    this.spawnRow()
    this.changeStatus( GameStatus.STARTED )
    this.startLoop()

    const levelData = this.level.data
    if (!levelData) return
    const cell = levelData[ levelData.length - 1 ][ Math.floor( levelData[ 0 ].length / 2 ) ]

    this.level.entities.push( templates.player.createEntity( cell.x, cell.y, 1 ) )
  }

  onResize = () => {
    const { canvas } = this.ctx

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    this.ctx.imageSmoothingEnabled = false
  }

  //

  spawnRow = () => {
    const { startCeilsCount, distance, level } = this
    const rows = 10
    const padding = Math.floor( Math.random() * 3 )
    // console.log( padding )

    level?.data?.unshift( Array.from(
      { length:padding + startCeilsCount + rows },
      (_, i) => new LevelCell(
        i + distance,
        -distance,
        i < padding ? [] : [ templates[ Math.random() > 0.2 ? `grassBlock` : `roadBlock` ].createTile( i + distance, -distance, 0, 1 ) ],
      ),
    ) )
  }
}
