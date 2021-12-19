import pathSrc from "../../img/path.png"
import Tile from "../Tile"

export type PathConfig = {
  size?: number
}

export default class Path extends Tile {
  constructor( x:number, y:number, { size }:PathConfig ) {
    super( x, y, { size, spriteSrc:pathSrc } )
  }

  tick = () => {
  }
}
