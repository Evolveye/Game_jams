import { LevelTileTemplate } from "./Tile"
import LevelCell from "./LevelCell"

export type LevelDefTiles = ((string[] | string)[] | string)[]
export type LevelDefNormalizedTiles = string[][][]

export type LevelDef = {
  tiles: LevelDefTiles
}

export type LevelConfig = {
  definition: LevelDef
  tileSize: number
}

export default class Level {
  tileTemplates: Record<string, LevelTileTemplate>
  data: LevelCell[][]
  tileSize: number

  constructor( tileTemplates:LevelTileTemplate[], { tileSize, definition }:LevelConfig ) {

    this.tileTemplates = tileTemplates.reduce( (obj, t) => {
      if (t.id in obj) throw new Error( `Doubled tile definition (${t.id})` )
      return { ...obj, [ t.id ]:t }
    }, {} )

    const normalizedTiles = this.normalizeDefinitionTiles( definition.tiles )
    this.data = this.parseDefinitionTiles( normalizedTiles )
    this.tileSize = tileSize
  }

  normalizeDefinitionTiles( tiles:LevelDefTiles ) {
    return tiles.map( (row:(typeof tiles)[number]) => {
      if (typeof row === `string`) return row.split( `;` ).map( str => str.split( `,` ).map( s => s.trim() ) )

      return row.map( (cell:(typeof row)[number]) => {
        if (typeof cell === `string`) return cell.split( `,` )

        return cell
      } )
    } )
  }

  parseDefinitionTiles( tiles:LevelDefNormalizedTiles ) {
    const templates = this.tileTemplates

    return tiles.map( (row, y) => row.map( (cell, x) =>
      new LevelCell( x, y, cell.map( id => templates[ id ].getTile( x, y, 1 ) ) ),
    ) )
  }

  draw = (ctx:CanvasRenderingContext2D) => {
    this.data.forEach( row => row.forEach( cell => cell.draw( ctx ) ) )
  }
}
