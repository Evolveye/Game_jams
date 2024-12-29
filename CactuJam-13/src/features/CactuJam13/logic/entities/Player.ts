import Keys from "../Keys"
import { EntityConfig, EntityDrawConfig } from "./Entity"
import MovingEntity, { MovingEntityUpdateData } from "./MovingEntity"
import playerSprite from "./player.png"

export class PlayerEntity extends MovingEntity {
  static speed = 0.3
  static fastSpeed = 1
  static slowingSpeed = 0.3
  static fastSlowingSpeed = 1
  static fastSlowingTriggerVelocity = 5
  static speedLimit = 200

  flymode = false

  constructor( x:number, y:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, { ...config, labels:[ `player` ], spriteSrc:playerSprite.src, boudingBoxColor:`#fffa` } )
    this.groundedOn = false
  }

  update( gameSpeedMultiplier:number, data:MovingEntityUpdateData ) {
    const isPressedLeft = Keys.isPressed( `left` )
    const isPressedRight = Keys.isPressed( `right` )
    const isPressedJump = Keys.isPressed( `space` )
    const isPressedDown = Keys.isPressed( `shiftleft` )

    const speed = (!this.groundedOn ? PlayerEntity.fastSpeed : PlayerEntity.speed) * gameSpeedMultiplier
    const slowingSpeed = (this.velocity.x < PlayerEntity.fastSlowingTriggerVelocity
      ? PlayerEntity.fastSlowingSpeed
      : PlayerEntity.slowingSpeed
    ) * gameSpeedMultiplier

    if (this.flymode && isPressedDown) this.y += 50
    if (isPressedJump && this.groundedOn) {
      if (this.flymode) this.y -= 50
      else {
        this.groundedOn = false

        const velocity = Math.abs( this.velocity.x )
        const jumpSpeed = (velocity > 50 ? -55
          : velocity > 40 ? -50
            : velocity > 25 ? -40
              : velocity > 10 ? -33
                : -27
        )

        this.velocity.y = jumpSpeed
      }
    }

    if (isPressedLeft) {
      if (this.velocity.x > 0) this.velocity.x -= speed * 2
      else this.velocity.x -= speed

      if (this.velocity.x < -PlayerEntity.speedLimit) this.velocity.x = -PlayerEntity.speedLimit
    } else {
      if (this.velocity.x < 0) {
        if (this.velocity.x > -slowingSpeed) this.velocity.x = 0
        else this.velocity.x += slowingSpeed
      }
    }

    if (isPressedRight) {
      if (this.velocity.x < 0) this.velocity.x += speed * 2
      else this.velocity.x += speed

      if (this.velocity.x > PlayerEntity.speedLimit) this.velocity.x = PlayerEntity.speedLimit
    } else {
      if (this.velocity.x > 0) {
        if (this.velocity.x < slowingSpeed) this.velocity.x = 0
        else this.velocity.x -= slowingSpeed
      }
    }

    super.update( gameSpeedMultiplier, data )
  }

  draw({ ctx, camera }:EntityDrawConfig) {
    super.draw({ ctx, camera, inTranslationDrawer: () => {
      if (this.flymode) {
        ctx.beginPath()
        ctx.arc( 0, 0, this.halfWidth * 1.5, 0, Math.PI * 2 )
        ctx.lineWidth = 5
        ctx.stroke()
      }
    } })
  }

  toggleFlyMode() {
    this.flymode = !this.flymode
    this.groundedOn = this.flymode
    this.velocity.y = 0
  }
}
