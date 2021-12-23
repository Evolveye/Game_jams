import Entity from "./Entity"

export class Void extends Entity {}
export default class LevelCell {
  #data:Entity[] = []
  x:number
  y:number


  constructor( x:number, y:number, entities:Entity[] ) {
    this.#data = entities
    this.x = x
    this.y = y
  }


  getData() {
    return [ ...this.#data ]
  }


  put( entity:Entity ) {
    if (entity) this.#data.push( entity )
  }


  top() {
    return this.#data[ this.#data.length - 1 ] ?? new Void( this.x, this.y )
  }


  forEach( callback:(item:Entity|null, layer:number) => void ) {
    this.#data.forEach( (item, itemIdx) => callback( item, itemIdx ) )
  }

  take() {
    return this.#data.pop() ?? null
  }
}
