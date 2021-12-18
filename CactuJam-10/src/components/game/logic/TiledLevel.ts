import Drawable from "./Drawable"
import LevelCell from "./LevelCell"

export default class TiledLevel {
  entities:Drawable[] = []

  #width:number
  #height:number
  #data: LevelCell[][]


  get width() {
    return this.#width
  }
  get height() {
    return this.#height
  }


  constructor( width:number, height:number ) {
    this.#width = width
    this.#height = height

    this.#generatelevel( width, height )
  }


  #generatelevel( width:number, height:number ) {
    const cellFiller = () => new LevelCell()

    this.#data = Array.from( { length:height }, () => Array.from( { length:width }, cellFiller ) )
  }


  getCell( x:number, y:number ) {
    return this.#data[ y ]?.[ x ]
  }


  putOnCell( x:number, y:number, item:Drawable ) {
    this.entities.push( item )
    this.getCell( x, y )?.put( item )
  }


  forEach( callback:(cell:LevelCell, x:number, y:number)=>void ) {
    this.#data.forEach( (row, rowIdx) => row.forEach( (cell, columnIdx) => callback( cell, columnIdx, rowIdx ) ) )
  }
}
