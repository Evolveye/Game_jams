import LevelCell from "./LevelCell"
import Entity from "./Entity"

export type SymbolDefinitions = Record<string, (x:number, y:number) => Entity>
export type Board = (string | string[])[][]
export type LevelConfig = {
  symbolDefs: SymbolDefinitions
  board: Board
}

export default class TiledLevel {
  entities:Entity[] = []

  #width:number
  #height:number
  #data: LevelCell[][]


  get width() {
    return this.#width
  }
  get height() {
    return this.#height
  }


  constructor({ symbolDefs, board:boardLike }:LevelConfig) {
    this.#width = 0
    this.#height = 0

    this.#data = boardLike.map( (row, y) => {
      if (row.length > this.#width) this.#width = row.length

      return row.map( (symbolOrStack, x) => {
        const symbolsStack = Array.isArray( symbolOrStack ) ? symbolOrStack : [ symbolOrStack ]
        const cellData = symbolsStack.map( symbol => {
          const item = symbol in symbolDefs ? symbolDefs[ symbol ]( x, y ) : null

          if (item instanceof Entity) {
            this.entities.push( item )
            return undefined
          }

          return item
        } ).filter( item => item !== undefined )

        return new LevelCell(cellData)
      } )
    } )

    // this.#generatelevel( this.#width, this.#height )
  }


  // #generatelevel( width:number, height:number ) {
  //   const cellFiller = () => new LevelCell()

  //   this.#data = Array.from( { length:height }, () => Array.from( { length:width }, cellFiller ) )
  // }


  getCell( x:number, y:number ) {
    return this.#data[ y ]?.[ x ]
  }


  putOnCell( x:number, y:number, item:Entity ) {
    this.entities.push( item )
    this.getCell( x, y )?.put( item )
  }


  forEach( callback:(cell:LevelCell, x:number, y:number)=>void ) {
    this.#data.forEach( (row, rowIdx) => row.forEach( (cell, columnIdx) => callback( cell, columnIdx, rowIdx ) ) )
  }

  getEntities( label?:string ) {
    if (!label) return this.entities
    else return this.entities.filter( e => e.labels.includes( label ) )
  }
}
