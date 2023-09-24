import { GameColors, HorizontallLine, Point, Rect, SemanticColor, TileShape, VerticalLine, isHorizontalLine, isPlayer, isPoint, isRect, isVerticalLine } from "./types"
import Tile from "./Tile"
import Cell from "./Cell"

export type TileType = SemanticColor

export type LevelData = (TileShape<Point | VerticalLine | HorizontallLine | Rect>)[]
export type CellCreator = (x:number, y:number) => Tile

type FillerCollectedCells = {
  x: number
  y: number
  createTile: CellCreator
}

export default class Level {
  levelDimensions = {
    x: 200,
    y: 200,
  }
  colors: GameColors
  levelData: Cell[][] = []
  cellSize = 5
  lastPlayerPos = { x:-1, y:-1 }
  drawOffset = { x:0, y:0 }

  constructor( colors:GameColors ) {
    this.colors = colors
    this.processLevelData( levelData )
  }


  processLevelData( levelData:LevelData ) {
    this.levelData = Array.from( { length:this.levelDimensions.y }, () => [] as Cell[] )

    levelData.forEach( item => {
      const getItemTile = () => new Tile( this.getColor( item.color ), [ item.tag ] )

      if (isRect( item )) {
        this.setRect( item.x, item.y, item.w, item.h, getItemTile )
      } else if (isHorizontalLine( item )) {
        this.setHorizontalLine( item.x, item.y, item.w, getItemTile )
      } else if (isVerticalLine( item )) {
        this.setVerticalLine( item.x, item.y, item.h, getItemTile )
      } else if (isPoint( item )) {
        this.setCellItem( item.x, item.y, getItemTile() )

        if (isPlayer( item )) {
          this.lastPlayerPos.x = item.x
          this.lastPlayerPos.y = item.y
        }
      }
    } )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    const { levelData, levelDimensions, drawOffset:drawoffset } = this
    const { width, height, center } = this.getCtxDimensions( ctx )
    const cellSize = width / levelDimensions.x

    ctx.clearRect( 0, 0, width, height )

    ctx.save()
    ctx.translate(
      center.x - (levelDimensions.x + drawoffset.x) * cellSize / 2,
      height - (levelDimensions.y - drawoffset.y) * cellSize,
    )
    levelData.forEach( (row, y) => row.forEach( (cell, x) => cell.items.forEach( item => {
      if (!item) return

      ctx.fillStyle = item.color
      ctx.fillRect( x * cellSize, y * cellSize, cellSize, cellSize )
    } ) ) )
    ctx.restore()
  }

  logic( ctx:CanvasRenderingContext2D ) {
    const { width, height, center } = this.getCtxDimensions( ctx )
    const player = this.getPlayerTile()
    const { levelDimensions, drawOffset } = this

    const cellSize = width / levelDimensions.x
    const playerCenterDiff = (player.y - drawOffset.y) * cellSize - center.y
    const visibleScreenCellHeight = Math.floor( height / cellSize )

    const isBottomVisible = drawOffset.y <= 0
    const isTopVisible = drawOffset.y >= levelDimensions.y - visibleScreenCellHeight

    if (!isBottomVisible) {
      if (playerCenterDiff < -25) this.drawOffset.y--
    } if (!isTopVisible) {
      if (playerCenterDiff > 25) this.drawOffset.y++
    }
  }


  createTile( x:number, y:number, type:TileType ) {
    this.setCellItem( x, y, new Tile( this.getColor( type ), [ type ] ) )
  }

  getPlayerTile() {
    let playerTileInfo = {
      ...this.lastPlayerPos,
      tile: this.getCell( this.lastPlayerPos.x, this.lastPlayerPos.y )?.getTop(),
    }

    if (!playerTileInfo.tile?.tags.has( `player` )) {
      console.log( `player losted` )

      for (let y = 0;  y < this.levelData.length;  ++y) {
        for (let x = 0;  x < this.levelData[ y ].length;  ++x) {
          const tile = this.levelData[ y ][ x ]?.getTop()

          if (tile?.tags.has( `player` )) {
            this.lastPlayerPos.x = x
            this.lastPlayerPos.y = y

            playerTileInfo.x = x
            playerTileInfo.y = y
            playerTileInfo.tile = tile

            break
          }
        }
      }
    }

    return playerTileInfo
  }

  movePlayerBy( x:number, y:number ) {
    const { tile:playerTile } = this.getPlayerTile()

    if (!playerTile) return

    const moved = this.moveTileBy( this.lastPlayerPos.x, this.lastPlayerPos.y, x, y )

    if (!moved) return

    this.lastPlayerPos.x += x
    this.lastPlayerPos.y += y

    if (this.lastPlayerPos.x < 0) this.lastPlayerPos.x = this.levelDimensions.x + this.lastPlayerPos.x
    else this.lastPlayerPos.x %= this.levelDimensions.x

    if (this.lastPlayerPos.y < 0) this.lastPlayerPos.y = this.levelDimensions.y + this.lastPlayerPos.y
    else this.lastPlayerPos.y %= this.levelDimensions.y

    return this.lastPlayerPos
  }

  moveTileBy( tileX:number, tileY:number, moveX:number, moveY:number ) {
    const cell = this.getCell( tileX, tileY )

    if (!cell) return false

    const targetCell = this.getCell( tileX + moveX, tileY + moveY )

    if (!targetCell) return false

    targetCell.clone( cell )
    cell.clear()

    return true
  }

  getColor( semanticColor:SemanticColor = `land` ) {
    if (semanticColor === `land`) return this.colors.safe
    else if (semanticColor === `deep land`) return `${this.colors.safe}aa`
    else if (semanticColor === `trail`) return `${this.colors.safe}77`
    else if (semanticColor === `danger`) return `${this.colors.danger}aa`
    return this.colors.safe
  }

  getCtxDimensions( ctx:CanvasRenderingContext2D ) {
    return {
      width: ctx.canvas.width,
      height: ctx.canvas.height,
      center: {
        x: ctx.canvas.width / 2,
        y: ctx.canvas.height / 2,
      },
    }
  }

  getCellNeighbours( x:number, y:number, includeDiagonal = false ) {
    const row = this.getRow( y )
    const rowAbove = this.getRow( y + 1 )
    const rowBelow = this.getRow( y - 1 )

    const ngbrs:Record<string, null | Tile> = {
      north: rowAbove?.[ x ]?.getTop()  ?? null,
      east: row?.[ x + 1 ]?.getTop()    ?? null,
      south: rowBelow?.[ x ]?.getTop()  ?? null,
      west: row?.[ x - 1 ]?.getTop()    ?? null,
    }

    if (includeDiagonal) {
      ngbrs.northEast = rowAbove?.[ x + 1 ]?.getTop() ?? null
      ngbrs.southEast = rowBelow?.[ x + 1 ]?.getTop() ?? null
      ngbrs.southWest = rowBelow?.[ x - 1 ]?.getTop() ?? null
      ngbrs.northWest = rowAbove?.[ x - 1 ]?.getTop() ?? null
    }

    return ngbrs
  }

  #collectCellsToFill( id:string, initialX:number, initialY:number, cellCreator:CellCreator, ignoreTags:[string, null | CellCreator][], areaLimit:number, collectedCells:FillerCollectedCells[] = [] ) {
    const topTile = this.getCell( initialX, initialY )?.getTop()
    const row = this.getRow( initialY )
    const filteringId = `filling-${id}`

    if (!row || row[ initialX ]?.tags.has( filteringId )) return true
    if (collectedCells.length > areaLimit) return false
    if (initialY > this.levelData.length || initialY < 0) return false
    if (topTile && !ignoreTags.some( ([ t ]) => topTile.tags.has( t ) )) return true

    const filler = (x:number, y:number) => {
      const cell = this.getCell( x, y )

      if (!cell) return false
      if (cell.tags.has( filteringId )) return false

      if (!cell.getTop()) collectedCells.push({ x, y, createTile:cellCreator })
      else {
        const fillTile = ignoreTags.find( ([ t ]) => cell.tags.has( t ) )?.[ 1 ]

        if (!fillTile) return false

        collectedCells.push({ x, y, createTile:fillTile })
      }

      cell.tags.add( filteringId )
      let isOk = this.#collectCellsToFill( id, x, y + 1, cellCreator, ignoreTags, areaLimit, collectedCells )

      if (!isOk) return null

      isOk = this.#collectCellsToFill( id, x, y - 1, cellCreator, ignoreTags, areaLimit, collectedCells )

      return isOk || null
    }

    for (let x = initialX;  x < row.length;  ++x) {
      if (collectedCells.length > areaLimit) return false

      const result = filler( x, initialY )
      if (result === null) return false
      if (!result) break
    }

    for (let x = initialX - 1;  x > 0;  --x) {
      if (collectedCells.length > areaLimit) return false

      const result = filler( x, initialY )
      if (result === null) return false
      if (!result) break
    }

    if (collectedCells.length > areaLimit) console.log({ collectedCells:collectedCells.length, areaLimit })
    return collectedCells.length <= areaLimit
  }

  fillArea( id:string, initialX:number, initialY:number, cellCreator:CellCreator, ignoreTags:[string, null | CellCreator][] = [], areaLimit = 1000 ) {
    const cellsToFill:FillerCollectedCells[] = []
    let isOk = this.#collectCellsToFill( id, initialX, initialY, cellCreator, ignoreTags, areaLimit, cellsToFill )

    if (!isOk) {
      console.log( `Area too big!`, { collectedCells:cellsToFill.length, areaLimit } )
      cellsToFill.forEach( ({ x, y }) => this.getCell( x, y )?.tags.delete( id ) )
      return false
    }

    cellsToFill.forEach( ({ x, y, createTile }) => {
      const cell = this.getCell( x, y )
      cell?.push( createTile( x, y ) )
      cell?.tags.delete( id )
    } )

    return true
  }

  fillAreaWithLand( x:number, y:number ) {
    const id = Date.now()
    return this.fillArea( `${id}`, x, y, () => new Tile( this.getColor( `deep land` ) ), [], 2000 )
  }

  getRow( y:number ) {
    const moduledY = y % this.levelDimensions.y
    const fixedY = moduledY < 0 ? -moduledY - 1 : this.levelData.length - 1 - moduledY
    return this.levelData[ fixedY ] ?? []
  }

  getCell( x:number, y:number ) {
    const row = this.getRow( y )

    if (!row) return null

    const moduledX = x % this.levelDimensions.x
    const fixedX = moduledX < 0 ? this.levelDimensions.x + moduledX : moduledX

    if (!row[ fixedX ]) row[ fixedX ] = new Cell()

    return row[ fixedX ]
  }

  setCellItem( x:number, y:number, data:Tile ) {
    const row = this.getRow( y )

    if (!row) return

    const fixedX = x < 0 ? row.length - x : x

    if (!row[ fixedX ]) row[ fixedX ] = new Cell()

    row[ fixedX ].push( data )
  }

  setHorizontalLine( x:number, y:number, width:number, dataCreator:CellCreator ) {
    const fixedY = y < 0 ? -y - 1 : this.levelData.length - y
    const row = this.levelData[ fixedY ]

    if (!row) return

    const fixedWidth = width < 0 ? this.levelDimensions.x - width : width
    const fixedX = x < 0 ? row.length - x : x

    for (let i = 0;  i < fixedWidth;  ++i) {
      if (!row[ fixedX + i ]) row[ fixedX + i ] = new Cell()
      row[ fixedX + i ].push( dataCreator( x, y ) )
    }
  }

  setVerticalLine( x:number, y:number, height:number, dataCreator:CellCreator ) {
    const fixedX = x < 0 ? this.levelDimensions.x - x : x

    for (let i = 0;  i < height;  ++i) {
      const row = this.getRow( y + i )

      if (!row) continue
      if (!row[ fixedX ]) row[ fixedX ] = new Cell()

      row[ fixedX ].push( dataCreator( x, y ) )
    }
  }

  setRect( x:number, y:number, width:number, height:number, dataCreator:CellCreator ) {
    const fixedX = x < 0 ? this.levelDimensions.x - x : x
    const fixedWidth = width < 0 ? this.levelDimensions.x - width : width

    for (let i = 0;  i < height;  ++i) {
      const row = this.getRow( y + i )

      if (!row) continue
      for (let j = 0;  j < fixedWidth;  ++j) {
        if (!row[ fixedX + j ]) row[ fixedX + j ] = new Cell()
        row[ fixedX + j ].push( dataCreator( x, y ) )
      }
    }
  }
}

const levelData:LevelData = [
  { tag:`player`, x:90, y:12 },
  // { tag:`land`,  x:0, y:11, w:-1 },
  // { tag:`deep land`, x:0, y:10, w:-1, h:10 },
  // { tag:`deep land`, x:0, y:-1, w:-1, h:1 },
  { tag:`deep land`, x:0, y:0, w:-1, h:1 },
  { tag:`deep land`, x:0, y:-1, w:-1, h:1 },
]
