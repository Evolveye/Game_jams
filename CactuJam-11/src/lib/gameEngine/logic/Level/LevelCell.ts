import { DrawVariant, LevelTile, Neighbours } from "./Tile"

export default class LevelCell {
  x: number
  y: number
  tiles: LevelTile[]

  constructor( x:number, y:number, tiles:LevelTile[] = [] ) {
    this.x = x
    this.y = y
    this.tiles = tiles
  }

  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, tileSize:number, variant:DrawVariant) => {
    this.tiles.forEach( tile => tile.draw( ctx, x, y, tileSize, variant ) )
  }

  getLayer( layer:number, fallbackFromTop = false ): LevelTile | null {
    const tile = this.tiles[ layer ]

    if (!tile && fallbackFromTop) return this.tiles[ this.tiles.length - 1 ]

    return tile
  }

  updateNeighbours = (neighbours:Neighbours) => {
    this.tiles.forEach( tile => tile.directionise( neighbours ) )
  }
}
