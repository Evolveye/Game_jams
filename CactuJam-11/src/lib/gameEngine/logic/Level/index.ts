import Game from "../Game"
import { LevelTile, LevelTileTemplate } from "./Tile"
import LevelCell from "./LevelCell"
import LevelBeingTemplate from "./LevelBeing"
import Entity, { EntityTemplate } from "./Entity"

export type Camera = {x: number; y: number}
export type LevelDefTiles = ((string[] | string)[] | string)[]
export type LevelDefNormalizedTiles = (null | string[])[][]

export type LevelDef<TGame extends Game<any> = Game<any>> = {
  tiles: LevelDefTiles
  script?: (level:Level<TGame>, game:TGame) => void
}

export type LevelConfig<TGame extends Game<any> = Game<any>> = {
  definition: LevelDef<TGame>
  tileSize: number
  variant: `normal` | `isometric`
}

export default class Level<TGame extends Game<any> = Game<any>> {
  templates: Record<string, LevelBeingTemplate>
  data: null | LevelCell[][] = null
  width: number = -1
  height: number = -1
  entities: Entity[] = []
  tileSize: number = -1
  config: LevelConfig<TGame>
  prunedRows = 0

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

    this.entities = []
    this.data = this.parseDefinitionTiles( normalizedTiles )
    this.directioniseTiles()
    this.tileSize = tileSize
    this.height = this.data.length
    this.width = this.data.reduce( (max, row) => row.length > max ? row.length : max, 0 )


    definition.script?.( this, game )
  }

  prune = (count:number) => {
    this.data?.splice( -count )
    this.prunedRows += count
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

      if (cell) cell.forEach( (templateId, i) => {
        if (entityInCell) throw new Error( `Only one entityt can be in cell. It have to be last item` )

        const template = templates[ templateId ]

        if (template instanceof EntityTemplate) {
          entityInCell = true

          this.entities.push( template.createEntity( x, y, 1 ) )
        } else if (template instanceof LevelTileTemplate) {
          tiles.push( template.createTile( x, y, tiles.length, i ) )
        }
      } )

      return new LevelCell( x, y, tiles )
    } ) )
  }

  directioniseTiles() {
    this.data?.forEach( (row, y) => row.forEach( (cell:LevelCell, x) => {
      const neighbours = {
        n:  this.getCell( x + 0, y - 1 ),
        ne: this.getCell( x + 1, y - 1 ),
        e:  this.getCell( x + 1, y + 0 ),
        se: this.getCell( x + 1, y + 1 ),
        s:  this.getCell( x + 0, y + 1 ),
        sw: this.getCell( x - 1, y + 1 ),
        w:  this.getCell( x - 1, y + 0 ),
        nw: this.getCell( x - 1, y - 1 ),
      }

      cell.updateNeighbours( neighbours )
    } ) )
  }

  spawnBeing = (x:number, y:number, template:LevelBeingTemplate) => {
    if (template instanceof EntityTemplate) {
      this.entities.push( template.createEntity( x, y, 1 ) )
    } else if (template instanceof LevelTileTemplate) {
      const tiles = this.getCell( x, y )?.tiles

      if (tiles) tiles.push( template.createTile( x, y, tiles.length, 1 ) )
    }
  }

  getCell = (x:number, y:number) => {
    return this.data?.[ y ]?.[ x ] ?? null
  }

  getEntityCell = (entity:Entity) => {
    const { data, prunedRows } = this

    if (!data) return null

    const offsetX = entity.y - entity.y % 2
    const cell = this.getCell( entity.x + offsetX, data.length - 1 + prunedRows + entity.y )

    // console.log({
    //   dataCellX: entity.x + offsetX,
    //   dataCellY: data.length - 1 + prunedRows + entity.y,
    //   dataLen: data.length,
    //   cellY: cell?.y,
    //   cellX: cell?.x,
    //   cell: cell,
    //   offsetX,
    //   entityX: entity.x,
    //   entityY: entity.y,
    // })

    return cell // && cell.x - cell.x % 2 == entity.x && cell.y == entity.y ? cell : null
  }

  getEntities = (predicate:(entity:Entity) => boolean) => {
    return this.entities.filter( predicate )
  }

  getEntitiesOnWrongTile = (predicate?:(entity:Entity) => boolean) => {
    return this.entities.filter( e => {
      const cell = this.getEntityCell( e )
      let canStandOn = e.canStandOn.includes( cell?.tiles[ 0 ]?.templateId ?? null )

      if (cell && cell.tiles[ 1 ] != null) return true
      if (canStandOn && predicate) canStandOn = predicate( e )
      // if (!canStandOn) console.log( e.canStandOn, canStandOn, e, cell )

      return !canStandOn
    } )
  }

  removeEntity = (entity:Entity) => {
    const entityIndex = this.entities.indexOf( entity )
    if (entityIndex !== -1) this.entities.splice( entityIndex, 1 )
  }

  draw = (ctx:CanvasRenderingContext2D, camera:Camera) => {
    const { data, tileSize } = this

    if (!data) return

    const cameraBorder = -camera.x / tileSize - 2// - 10// ctx.canvas.width / 2

    data.forEach( (row, y) => {
      ctx.save()
      if ((data.length - y) % 2) ctx.translate( tileSize / 2, 0 )
      // ;[ ...row ].reverse().forEach( (cell, x) => cell.draw( ctx, y, x, tileSize, this.config.variant ) )
      ;[ ...row ].reverse().forEach( (cell, x) => cell.tiles[ 0 ]?.x > cameraBorder && cell.draw( ctx, y, x, tileSize, this.config.variant ) )
      ctx.restore()
    } )

    this.entities.forEach( entity => {
      ctx.save()
      let translateX = tileSize * 0.5

      if (entity.y % 2) translateX *= 2

      ctx.translate( translateX, 0 )
      entity.draw( ctx, tileSize )
      ctx.restore()
    } )
  }
}
