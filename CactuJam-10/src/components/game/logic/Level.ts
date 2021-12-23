import LevelCell from "./LevelCell"
import MovingEntity from "./MovingEntity"
import Entity from "./Entity"
import Game from "./Game"

export type SymbolDefinitions = Record<string, (x:number, y:number) => (Entity|MovingEntity|Entity[])>
export type Board = (string | string[])[][]
export type LevelConfig = {
  symbolDefs: SymbolDefinitions
  board: Board
  tileSize?: number
  script: (level:Level) => void
}

export default class Level {
  game:Game
  entities:MovingEntity[] = []
  tileSize = 32

  #script:(level:Level) => void
  #width:number
  #height:number
  #data:LevelCell[][]


  get width() {
    return this.#width
  }
  get height() {
    return this.#height
  }


  constructor({ script, symbolDefs, board:boardLike, tileSize = 32 }:LevelConfig) {
    this.#width = 0
    this.#height = 0
    this.tileSize = tileSize
    this.#script = script

    this.#data = boardLike.map( (row, y) => {

      const normalizedRow = row.reduce<( string | string[])[]>( (arr, strOrStack) => {
        if (typeof strOrStack === `string`) return [ ...arr, ...strOrStack.split( `` ) ]
        else return [ ...arr, strOrStack ]
      }, [] )

      if (normalizedRow.length > this.#width) this.#width = normalizedRow.length

      return normalizedRow.map( (strOrStack, x) => {
        const symbolsStack = Array.isArray( strOrStack ) ? strOrStack : [ strOrStack ]
        const cellData = symbolsStack.flatMap( symbols => symbols.split( `` ).map( symbol => {
          const entityOrArr = symbol in symbolDefs ? symbolDefs[ symbol ]( x, y ) : null
          const entitiesArr = Array.isArray( entityOrArr ) ? entityOrArr : [ entityOrArr ]

          return entitiesArr.map( e => this.#configureEntity( e ) )
        } ) ).flat().filter( item => item !== undefined )

        return new LevelCell(x, y, cellData)
      } )
    } )

    if (this.#data.length > this.#height) this.#height = this.#data.length

    // this.#generatelevel( this.#width, this.#height )
  }


  setGame = (game:Game) => {
    this.game = game
  }


  #configureEntity = (entity:Entity) => {
    if (typeof entity?.setExistingWorld === `function`) entity?.setExistingWorld( this )

    if (entity instanceof MovingEntity) {
      this.entities.push( entity )
      return undefined
    }

    return entity
  }


  runScript = () => this.#script( this )


  // #generatelevel( width:number, height:number ) {
  //   const cellFiller = () => new LevelCell()

  //   this.#data = Array.from( { length:height }, () => Array.from( { length:width }, cellFiller ) )
  // }


  getCell( tileX:number, tileY:number, isStrict = false ) {
    const cell = this.#data[ tileY ]?.[ tileX ]

    if (cell || isStrict) return cell
    if (!this.#data[ tileY ]) this.#data[ tileY ] = []

    const newCell = new LevelCell(tileX, tileY, [])

    this.#data[ tileY ][ tileX ] = newCell

    return newCell
  }


  // putOnCell( x:number, y:number, item:Tile ) {
  //   this.entities.push( item )
  //   this.getCell( x, y )?.put( item )
  // }


  forEach( callback:(cell:LevelCell, x:number, y:number)=>void ) {
    this.#data.forEach( (row, rowIdx) => row.forEach( (cell, columnIdx) => callback( cell, columnIdx, rowIdx ) ) )
  }


  getEntities( label?:string ) {
    if (label) return this.entities.filter( e => e.labels.some( l => l === label ) )

    return this.entities
  }


  takeFromTop( tileX, tileY ) {
    return this.#data[ tileY ]?.[ tileX ]?.take() ?? null
  }


  spawn = (entity:Entity) => {
    const { x, y } = entity.getTilePos()

    this.#configureEntity( entity )
    this.getCell( x, y ).put( entity )

    return entity
  }
}
