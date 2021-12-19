import pathSrc from "../../img/path.png"
import Entity from "../Entity"

export type PathConfig = {
  size?: number
}

export default class Path extends Entity {
  constructor( x:number, y:number, { size }:PathConfig = {} ) {
    super( x, y, { size, spriteSrc:pathSrc } )
  }

  tick = () => {}
}
