import houseSrc from "../../img/house.png"
import Entity from "../Entity"
import Gift from "./Gift"

export type PathConfig = {
  size?: number
}

export default class House extends Entity {
  #gifts:Gift[] = []

  constructor( x:number, y:number, { size = 1.5 }:PathConfig = {} ) {
    super( x, y, { size, spriteSrc:houseSrc } )
  }

  pushGift = (gift:Gift) => {
    this.#gifts.push( gift )
  }

  tick = () => {}
}
