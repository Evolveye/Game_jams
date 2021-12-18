import Entity from "./Entity"

export default class LevelCell {
  #data:Entity[] = []


  constructor( entities:Entity[] ) {
    this.#data = entities
  }


  put( entity:Entity ) {
    this.#data.push( entity )
  }


  forEach( callback:(item:Entity|null, depth:number) => void ) {
    this.#data.forEach( (item, itemIdx) => callback( item, this.#data.length - itemIdx ) )
  }
}
