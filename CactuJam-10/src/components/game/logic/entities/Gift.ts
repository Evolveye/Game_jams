import giftSrc from "../../img/gift.png"
import Entity from "../Entity"

export type PathConfig = {
  size?: number
}

export default class Gift extends Entity {
  constructor( x:number, y:number, { size = 0.5 }:PathConfig = {} ) {
    super( x, y, { size, spriteSrc:giftSrc } )
  }

  tick = () => {}
}
