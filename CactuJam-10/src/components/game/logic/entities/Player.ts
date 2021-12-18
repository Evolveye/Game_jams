import Entity from "../Entity"
import playerSrc from "../../img/player.png"

export default class Player extends Entity {
  constructor( x:number, y:number ) {
    super( x, y, { spriteSrc:playerSrc, framesPerRow:2, framesPerColumn:3 } )
  }
}
