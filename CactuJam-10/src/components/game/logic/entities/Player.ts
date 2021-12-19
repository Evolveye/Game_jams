import Gift from "./Gift"
import playerSrc from "../../img/player.png"
import MovingEntity from "../MovingEntity"

export type PlayerConfig = {
  speed?: number,
  size?: number
}

export default class Player extends MovingEntity {
  constructor( x:number, y:number, { speed = 0.2, size }:PlayerConfig = {} ) {
    super( x, y, { labels:[ `player` ], size, spriteSrc:playerSrc, framesPerRow:2, framesPerColumn:3 } )

    if (speed) this.setSpeed( speed )
  }


  tick = (delta:number) => {
    this.nextFrame()
    this.move( delta )

    if (this.isKeyOnce( `q` )) {
      const thing = this.getThingImOn()

      if (thing instanceof Gift) {
        this.addToInventory({
          name: `Gift`,
          entity: this.takeFromWorld(),
        })
      }
    }
  }


  move = (delta:number) => {
    const dirs = {
      left: this.isKey( `leftDirection` ),
      right: this.isKey( `rightDirection` ),
      up: this.isKey( `upDirection` ),
      down: this.isKey( `downDirection` ),
    }

    let shouldGo = false

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
  }
}
