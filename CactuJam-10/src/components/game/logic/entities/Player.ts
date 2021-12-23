import Gift from "./Gift"
// import playerSrc from "../../img/player.png"
import santaSrc from "../../img/santa.png"
import frostSrc from "../../img/frost.png"
import MovingEntity from "../MovingEntity"
import Path from "./Path"
import House from "./House"

const characterType = Math.random() > 0.5 ? `santa` : `frost`
export type PlayerConfig = {
  speed?: number,
  size?: number
}

export default class Player extends MovingEntity {
  score = 0


  constructor( x:number, y:number, { speed = 0.2, size }:PlayerConfig = {} ) {
    // super( x, y, { cantMoveOn:[], labels:[ `player` ], size, spriteSrc:playerSrc, framesPerRow:2, framesPerColumn:3 } )
    super( x, y, { cantMoveOn:[], labels:[ `player` ], size, spriteSrc:characterType === `frost` ? frostSrc : santaSrc } )

    if (speed) this.setSpeed( speed )
  }


  tick = (delta:number) => {
    this.nextFrame()
    this.move( delta )

    if (this.isKeyOnce( `q` )) {
      const thing = this.getThingImOn()

      if (thing instanceof Gift) {
        this.addToInventory({
          name: `Prezent`,
          entities: [ this.takeFromWorld() ],
        })
      } else if (thing instanceof House) {
        const [ gift ] =  this.removeFromInventory( `Prezent` ) as Gift[]

        if (gift) {
          thing.pushGift( gift )
          this.score += 10


          const savedPoints = Number( localStorage.getItem( characterType ) ) ?? 0
          localStorage.setItem( characterType, `${this.score + savedPoints}` )
        }
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
