import { GameColors, HorizontallLine, Point, Rect, SemanticColor, VerticalLine, isHorizontalLine, isPoint, isRect, isVerticalLine } from "./types"
import Tile from "./Tile"

export type LevelData = (Point | VerticalLine | HorizontallLine | Rect)[]

export default class Level {
  levelDimensions = {
    x: 200,
    y: 150,
  }
  colors: GameColors
  levelData: Tile[][] = []
  cellSize = 5

  constructor( colors:GameColors ) {
    this.colors = colors
    this.processLevelData( levelData )
  }


  processLevelData( levelData:LevelData ) {
    this.levelData = Array.from( { length:this.levelDimensions.y }, () => [] as Tile[] )

    levelData.forEach( item => {
      if (isRect( item )) {
        this.setRect( item.x, item.y, item.w, item.h, () => new Tile( this.getColor( item.color ) ) )
      } else if (isHorizontalLine( item )) {
        this.setHorizontalLine( item.x, item.y, item.w, () => new Tile( this.getColor( item.color ) ) )
      } else if (isVerticalLine( item )) {
        this.setVerticalLine( item.x, item.y, item.h, () => new Tile( this.getColor( item.color ) ) )
      } else if (isPoint( item )) {
        this.setCell( item.x, item.y, new Tile( this.getColor( item.color ) ) )
      }
    } )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    const { levelData, cellSize, levelDimensions } = this
    const { width, height, center } = this.getCtxDimensions( ctx )

    ctx.clearRect( 0, 0, width, height )

    ctx.save()
    ctx.translate( center.x - levelDimensions.x * cellSize / 2, 0 )
    levelData.forEach( (row, y) => row.forEach( (cell, x) => {
      ctx.fillStyle = cell.color
      ctx.fillRect( x * cellSize, y * cellSize, cellSize, cellSize )
    } ) )
    ctx.restore()
  }


  getColor( semanticColor:SemanticColor = `land` ) {
    if (semanticColor === `land`) return this.colors.safe
    else if (semanticColor === `land-50`) return `${this.colors.safe}aa`
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

  setCell( x:number, y:number, data:Tile ) {
    const fixedY = y < 0 ? -y - 1 : this.levelData.length - y
    const row = this.levelData[ fixedY ]
    if (!row) return

    const fixedX = x < 0 ? row.length - x : x
    row[ fixedX ] = data
  }

  setHorizontalLine( x:number, y:number, width:number, dataCreator:(x:number, y:number) => Tile ) {
    const fixedY = y < 0 ? -y - 1 : this.levelData.length - y
    const row = this.levelData[ fixedY ]

    if (!row) return

    const fixedWidth = width < 0 ? this.levelDimensions.x - width : width
    const fixedX = x < 0 ? row.length - x : x

    for (let i = 0;  i < fixedWidth;  ++i) row[ fixedX + i ] = dataCreator( x, y )
  }

  setVerticalLine( x:number, y:number, height:number, dataCreator:(x:number, y:number) => Tile ) {
    const fixedY = y < 0 ? -y - 1 : this.levelDimensions.y - y
    const fixedX = x < 0 ? this.levelDimensions.x - x : x

    for (let i = 0;  i < height;  ++i) {
      const row = this.levelData[ fixedY + i ]
      row[ fixedX ] = dataCreator( x, y )
    }
  }

  setRect( x:number, y:number, width:number, height:number, dataCreator:(x:number, y:number) => Tile ) {
    const fixedY = y < 0 ? -y - 1 : this.levelDimensions.y - y
    const fixedX = x < 0 ? this.levelDimensions.x - x : x
    const fixedWidth = width < 0 ? this.levelDimensions.x - width : width

    for (let i = 0;  i < height;  ++i) {
      const row = this.levelData[ fixedY + i ]

      for (let j = 0;  j < fixedWidth;  ++j) row[ fixedX + j ] = dataCreator( x, y )
    }
  }
}

const levelData:LevelData = [
  { x:-1, y:-1 },
  { x:30, y:40 },
  { x:90, y:60 },
  { color:`land`,  x:0, y:11, w:-1 },
  { color:`land-50`, x:0, y:10, w:-1, h:10 },
]
