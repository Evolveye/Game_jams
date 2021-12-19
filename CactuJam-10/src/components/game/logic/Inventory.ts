import Entity from "./Entity"

export type ThingInInventory = {
  entity: Entity
  name: string
  count?: number
}

export default class Inventory {
  #data:Record<string, ThingInInventory> = {}

  add( ...things:ThingInInventory[] ) {
    const data = this.#data

    things.forEach( ({ entity, name, count = 1 }) => {
      if (!(name in data)) {
        data[ name ] = {
          count: 0,
          name,
          entity,
        }
      }

      const thing = data[ name ]

      thing.count += count

      if (thing.count < 0) thing.count = 0
    } )
  }

  getData = () => Object.values( this.#data )
}
