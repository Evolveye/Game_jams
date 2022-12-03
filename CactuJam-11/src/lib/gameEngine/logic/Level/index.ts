import Game from "../Game"
import { LevelTile, LevelTileTemplate } from "./Tile"
import LevelCell from "./LevelCell"
import LevelBeingTemplate from "./LevelBeing"
import Entity, { EntityTemplate } from "./Entity"

export type LevelDefTiles = ((string[] | string)[] | string)[]
export type LevelDefNormalizedTiles = (null | string[])[][]

export type LevelDef<TGame extends Game<any> = Game<any>> = {
  tiles: LevelDefTiles
  script: (level:Level<TGame>, game:TGame) => void
}

export type LevelConfig<TGame extends Game<any> = Game<any>> = {
  definition: LevelDef<TGame>
  tileSize: number
}

export default class Level<TGame extends Game<any> = Game<any>> {
  templates: Record<string, LevelBeingTemplate>
  data: null | LevelCell[][] = null
  width: number = -1
  height: number = -1
  entities: Entity[] = []
  tileSize: number = -1
  config: LevelConfig<TGame>

  constructor( templates:Record<string, LevelBeingTemplate> | LevelBeingTemplate[], config:LevelConfig<TGame> ) {
    this.templates = (Array.isArray( templates ) ? templates : Object.values( templates )).reduce( (obj, t) => {
      if (t.id in obj) throw new Error( `Doubled tile definition (${t.id})` )
      return { ...obj, [ t.id ]:t }
    }, {} )

    this.config = config
  }

  init = (game:TGame) => {
    const { definition, tileSize } = this.config
    const normalizedTiles = this.normalizeDefinitionTiles( definition.tiles )
    this.data = this.parseDefinitionTiles( normalizedTiles )
    this.tileSize = tileSize

    this.height = this.data.length
    this.width = this.data.reduce( (max, row) => row.length > max ? row.length : max, 0 )

    definition.script?.( this, game )
  }

  normalizeDefinitionTiles( tiles:LevelDefTiles ): LevelDefNormalizedTiles {
    return tiles.map( (row:(typeof tiles)[number]) => {
      if (typeof row === `string`) return row.split( ` ` ).map( (str, i) =>
        str === `` ? (i % 2 ? null : undefined) : str.split( `,` ).map( s => s.trim() ),
      ).filter( cell => cell !== undefined ) as (string[] | null)[]

      return row.map( (cell:(typeof row)[number]) => {
        if (typeof cell === `string`) return cell.split( `,` )

        return cell
      } )
    } )
  }

  parseDefinitionTiles( tiles:LevelDefNormalizedTiles ) {
    const templates = this.templates

    return tiles.map( (row, y) => row.map( (cell, x) => {
      const tiles:LevelTile[] = []
      let entityInCell = false

      if (cell) for (const templateId of cell) {
        if (entityInCell) throw new Error( `Only one entityt can be in cell. It have to be last item` )

        const template = templates[ templateId ]

        if (template instanceof EntityTemplate) {
          entityInCell = true

          this.entities.push( template.createEntity( x, y, 1 ) )

          continue
        } else if (template instanceof LevelTileTemplate) {
          tiles.push( template.createTile( x, y, 1 ) )
        }
      }

      return new LevelCell( x, y, tiles )
    } ) )
  }

  spawnBeing = (x:number, y:number, template:LevelBeingTemplate) => {
    if (template instanceof EntityTemplate) {
      this.entities.push( template.createEntity( x, y, 1 ) )
    } else if (template instanceof LevelTileTemplate) {
      this.getCell( x, y )?.tiles.push( template.createTile( x, y, 1 ) )
    }
  }

  getCell = (x:number, y:number) => {
    return this.data?.[ y ]?.[ x ]
  }

  draw = (ctx:CanvasRenderingContext2D) => {
    this.data?.forEach( row => [ ...row ].reverse().forEach( cell => cell.draw( ctx, this.tileSize ) ) )
    this.entities.forEach( entity => entity.draw( ctx, this.tileSize ) )
  }
}
