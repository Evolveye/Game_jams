import pathSrc from "../../img/path.png"
import Tile from "../Tile"

export default class Path extends Tile {
  constructor( x:number, y:number ) {
    super( x, y, { spriteSrc:pathSrc } )
  }

  tick = () => {
  }
}
