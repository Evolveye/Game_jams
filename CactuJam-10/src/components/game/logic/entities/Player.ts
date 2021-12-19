import Entity from "../Entity"
import playerSrc from "../../img/player.png"

export default class Player extends Entity {
  constructor( x:number, y:number, speed?:number ) {
    super( x, y, { spriteSrc:playerSrc, framesPerRow:2, framesPerColumn:3 } )

    if (speed) this.setSpeed( speed )
  }

  tick = (tFrame:number) => {
    this.nextFrame()

    if (this.isKey( `leftDirection` )) this.goLeft()
    if (this.isKey( `rightDirection` )) this.goRight()
    if (this.isKey( `upDirection` )) this.goUp()
    if (this.isKey( `downDirection` )) this.goDown()
    if (this.isKeyOnce( `q` )) console.log( this.getThingImOn() )
  }
}
