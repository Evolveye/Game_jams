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

type MovePlayerConfig = {
  withTeleportation?: boolean
  swapeableTags?: string[]
}

export type PlayerMoverReturnType = void | {collidingCell: null | Cell} | {
  x: number
  y: number
  swapedCell: null | Cell
}

export default class Level {
  levelDimensions = {
    x: 200,
    y: 600,
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
      const getItemTile = () => new Tile( this.getColor( item.color ), item.tags )

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
    const visibleScreenCellHeight = Math.floor( height / cellSize )

    ctx.clearRect( 0, 0, width, height )

    ctx.save()
    ctx.translate(
      center.x - (levelDimensions.x + drawoffset.x) * cellSize / 2,
      height - (levelDimensions.y - drawoffset.y) * cellSize,
    )

    const slicedY = levelDimensions.y - drawoffset.y - visibleScreenCellHeight
    levelData.slice( slicedY, levelDimensions.y - drawoffset.y )
      .forEach( (row, insliceY) => row.forEach( (cell, x) => cell.items.forEach( item => {
        if (!item) return

        const y = slicedY + insliceY

        if (item.tags.has( `border` )) {
          const shift = cellSize / 4

          ctx.fillStyle = `${this.colors.safe}aa`
          ctx.fillRect( x * cellSize - shift, y * cellSize - shift, cellSize, cellSize )
          ctx.fillStyle = `${this.colors.danger}aa`
          ctx.fillRect( x * cellSize + shift, y * cellSize + shift, cellSize, cellSize )
        } else {
          ctx.fillStyle = item.color
          ctx.fillRect( x * cellSize, y * cellSize, cellSize, cellSize )
        }
      } ) ) )
    ctx.restore()
  }

  logic( ctx:CanvasRenderingContext2D ) {
    const { width, height, center } = this.getCtxDimensions( ctx )
    const player = this.getPlayerTile()
    const { levelDimensions, drawOffset } = this

    const cellSize = width / levelDimensions.x
    const playerCenterDiff = (player.y - drawOffset.y) - center.y / cellSize
    const visibleScreenCellHeight = Math.floor( height / cellSize )

    const bottomVisibilityOffset = drawOffset.y
    const topVisibilityOffset = levelDimensions.y - visibleScreenCellHeight - drawOffset.y

    // if (Math.abs( playerCenterDiff ) > visibleScreenCellHeight / 2) {
    //   console.log( `Not implemented!` )
    //   // if (topVisibilityOffset > 0 || bottomVisibilityOffset > 0) {

    //   //   drawOffset.y -= playerCenterDiff
    //   // }
    // } else {
    if (bottomVisibilityOffset > 0) {
      if (playerCenterDiff < -25) this.drawOffset.y--
    } if (topVisibilityOffset > 0) {
      if (playerCenterDiff > 25) this.drawOffset.y++
    }
    // }
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

  movePlayerBy( x:number, y:number, { withTeleportation = false, swapeableTags = [ `trail`, `land`, `deep land` ] }:MovePlayerConfig = {} ): PlayerMoverReturnType {
    const { tile:playerTile } = this.getPlayerTile()

    if (!playerTile) return

    const swapedCell = this.moveTileBy( this.lastPlayerPos.x, this.lastPlayerPos.y, x, y, { withTeleportation, swapeableTags } )

    if (!swapedCell) return { collidingCell:this.getCell( this.lastPlayerPos.x + x, this.lastPlayerPos.y + y ) }

    this.lastPlayerPos.x += x
    this.lastPlayerPos.y += y

    if (this.lastPlayerPos.x < 0) this.lastPlayerPos.x = this.levelDimensions.x + this.lastPlayerPos.x
    else this.lastPlayerPos.x %= this.levelDimensions.x

    if (this.lastPlayerPos.y < 0) this.lastPlayerPos.y = this.levelDimensions.y + this.lastPlayerPos.y
    else this.lastPlayerPos.y %= this.levelDimensions.y

    return {
      ...this.lastPlayerPos,
      swapedCell,
    }
  }

  moveTileBy( tileX:number, tileY:number, moveX:number, moveY:number, { withTeleportation = false, swapeableTags = [] }:MovePlayerConfig = {} ) {
    const cell = this.getCell( tileX, tileY, withTeleportation )

    if (!cell) return false

    const targetCell = this.getCell( tileX + moveX, tileY + moveY, withTeleportation )

    if (!targetCell) return false

    const topTags = targetCell.getTop()?.tags

    if (topTags && swapeableTags.length && !swapeableTags.some( t => topTags?.has( t ) )) return false

    const targetClone = new Cell()
    targetClone.clone( targetCell )

    targetCell.clone( cell )
    cell.clear()

    return targetClone
  }

  getColor( semanticColor:SemanticColor = `land` ) {
    if (semanticColor === `land`) return this.colors.safe
    else if (semanticColor === `deep land`) return `${this.colors.safe}aa`
    else if (semanticColor === `trail`) return `${this.colors.safe}77`
    else if (semanticColor === `danger`) return `${this.colors.danger}aa`
    return semanticColor
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
    if (topTile && ignoreTags.length && ignoreTags.some( ([ t ]) => topTile.tags.has( t ) )) return false

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

    for (let x = initialX;  x < this.levelDimensions.x;  ++x) {
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

    return cellsToFill.length
  }

  fillAreaWithLand( x:number, y:number ) {
    const id = Date.now()
    return this.fillArea( `${id}`, x, y, () => new Tile( this.getColor( `deep land` ), [ `deep land` ] ), [ [ `border`, null ] ], 2000 )
  }

  removeTagged( tag:string ) {
    for (let y = 0;  y < this.levelData.length;  ++y) {
      for (let x = 0;  x < this.levelData[ y ].length;  ++x) {
        const cell = this.levelData[ y ][ x ]

        if (!cell?.getTop()?.tags.has( tag )) continue

        cell.clear()
      }
    }
  }

  getRow( y:number, withTeleportation = false ) {
    if (!withTeleportation && (y < 0 || y >= this.levelDimensions.y)) return null

    const moduledY = y % this.levelDimensions.y
    const fixedY = moduledY < 0 ? -moduledY - 1 : this.levelData.length - 1 - moduledY

    return this.levelData[ fixedY ] ?? []
  }

  getCell( x:number, y:number, withTeleportation = false ) {
    if (!withTeleportation && (x < 0 || x >= this.levelDimensions.x)) return null

    const row = this.getRow( y, withTeleportation )

    if (!row) return null

    const moduledX = x % this.levelDimensions.x
    const fixedX = moduledX < 0 ? this.levelDimensions.x + moduledX : moduledX

    if (!row[ fixedX ]) row[ fixedX ] = new Cell()

    return row[ fixedX ]
  }

  setCell( x:number, y:number ) {
    const row = this.getRow( y )

    if (!row) return

    const fixedX = x < 0 ? row.length - x : x

    row[ fixedX ] = new Cell()
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
  { tags:[ `deep land` ], x:0, y:-1, w:-1, h:1 },

  { tags:[ `border`, `border-2` ], x:0, y:450, w:-1, h:2 },

  { tags:[ `border`, `border-1` ], x:0, y:150, w:-1, h:2 },

  { tags:[ `player` ], x:90, y:10 },
  { tags:[ `deep land` ], x:0, y:0, w:-1, h:10 },
]
