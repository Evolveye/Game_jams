import Tile from "./Tile"

export default class LevelCell {
  #data:Tile[] = []


  constructor( entities:Tile[] ) {
    this.#data = entities
  }


  put( entity:Tile ) {
    this.#data.push( entity )
  }


  top() {
    return this.#data[ this.#data.length - 1 ]
  }


  forEach( callback:(item:Tile|null, depth:number) => void ) {
    this.#data.forEach( (item, itemIdx) => callback( item, this.#data.length - itemIdx ) )
  }
}
