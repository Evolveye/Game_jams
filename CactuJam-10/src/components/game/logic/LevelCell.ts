import Drawable from "./Drawable"

export default class LevelCell {
  #data = []


  put( drawable:Drawable ) {
    this.#data.push( drawable )
  }


  forEach( callback:(item:Drawable, depth:number) => void ) {
    this.#data.forEach( (item, itemIdx) => callback( item, this.#data.length - itemIdx ) )
  }
}
