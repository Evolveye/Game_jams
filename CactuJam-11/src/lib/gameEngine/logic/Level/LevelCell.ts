import { LevelTile } from "./Tile"

export default class LevelCell {
  x: number
  y: number
  tiles: LevelTile[]

  constructor( x:number, y:number, tiles:LevelTile[] = [] ) {
    this.x = x
    this.y = y
    this.tiles = tiles
  }

  draw = (ctx:CanvasRenderingContext2D) => {
    this.tiles.forEach( tile => tile.draw( ctx ) )
  }
}
