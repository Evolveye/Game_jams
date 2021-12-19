import Entity from "../Entity"
import playerSrc from "../../img/player.png"

export type PlayerConfig = {
  speed?: number,
  size?: number
}

export default class Player extends Entity {
  constructor( x:number, y:number, { speed = 0.2, size }:PlayerConfig ) {
    super( x, y, { size, spriteSrc:playerSrc, framesPerRow:2, framesPerColumn:3 } )

    if (speed) this.setSpeed( speed )
  }

  tick = (delta:number) => {
    this.nextFrame()

    let shouldGo = false

    const dirs = this.getActiveMovementDirections()
    const setAngle = angle => {
      shouldGo = true
      this.setAngle( angle )
    }

    if (dirs.up) {
      if (dirs.right) setAngle( 45 )
      else if (dirs.left) setAngle( 125 )
      else setAngle( 90 )
    } else if (dirs.down) {
      if (dirs.right) setAngle( -45 )
      else if (dirs.left) setAngle( -125 )
      else setAngle( -90 )
    } else if (dirs.left) {
      setAngle( 180 )
    } else if (dirs.right) {
      setAngle( 0 )
    }

    if (shouldGo) this.go( this.speed * delta )

    if (this.isKeyOnce( `q` )) console.log( this.getThingImOn() )
  }

  getActiveMovementDirections = () => {
    return {
      left: this.isKey( `leftDirection` ),
      right: this.isKey( `rightDirection` ),
      up: this.isKey( `upDirection` ),
      down: this.isKey( `downDirection` ),
    }
  }
}
