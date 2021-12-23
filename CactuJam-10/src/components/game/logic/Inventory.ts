import Entity from "./Entity"

export type ThingInInventory = {
  entities: Entity[]
  name: string
}

export class InventoryItem {
  name:string
  #entities:Entity[] = []


  get count() {
    return this.#entities.length
  }


  constructor( name ) {
    this.name = name
  }


  push( entities:Entity[] ) {
    this.#entities.push( ...entities )
  }


  pop( count ) {
    return this.#entities.splice( -count )
  }
}

export default class Inventory {
  #data:Record<string, InventoryItem> = {}

  add( ...things:ThingInInventory[] ) {
    const data = this.#data

    things.forEach( ({ entities, name }) => {
      if (!(name in data)) {
        data[ name ] = new InventoryItem(name)
      }

      data[ name ].push( entities )
    } )
  }


  remove = (name:string, count:number = 1) => {
    return this.#data[ name ].pop( count )
  }


  getData = () => Object.values( this.#data )
}
