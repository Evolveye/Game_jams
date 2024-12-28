import Keys from "../Keys"
import { EntityConfig } from "./Entity"
import MovingEntity, { MovingEntityUpdateData } from "./MovingEntity"
import playerSprite from "./player.png"

export class PlayerEntity extends MovingEntity {
  constructor( x:number, y:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, { ...config, labels:[ `player` ], spriteSrc:playerSprite.src } )
  }

  update( data:MovingEntityUpdateData ) {
    if (Keys.isPressed( `space` ) && !this.gravityInfluencing) {
      this.gravityInfluencing = true

      const velocity = Math.abs( this.velocity.x )
      this.velocity.y = velocity > 50 ? -100
        : velocity > 40 ? -85
          : velocity > 30 ? -70
            : velocity > 20 ? -60
              : -50
    }

    const speed = 4

    if (Keys.isPressed( `left` )) {
      if (this.velocity.x > 0) this.velocity.x -= speed * 2
      else this.velocity.x -= speed
    } else {
      if (this.velocity.x < 0) this.velocity.x += 2
    }

    if (Keys.isPressed( `right` )) {
      if (this.velocity.x < 0) this.velocity.x += speed * 2
      else this.velocity.x += speed
    } else {
      if (this.velocity.x > 0) this.velocity.x -= 2
    }

    super.update( data )
  }
}
