import Keys from "../Keys"
import { EntityConfig, EntityDrawConfig } from "./Entity"
import MovingEntity, { MovingEntityUpdateData } from "./MovingEntity"
import { PlatformEntity } from "./Platform"
import playerSprite from "./player.png"
import playerIdleSprite from "./player-idle.png"
import playerFallingSprite from "./player-falling.png"
import { PowerupEntity, PowerupType } from "./Powerups"
import sounds from "../sounds"

export class PlayerEntity extends MovingEntity {
  static speed = 0.3
  static fastSpeed = 1
  static slowingSpeed = 0.3
  static fastSlowingSpeed = 1
  static fastSlowingTriggerVelocity = 5
  static speedLimit = 200

  flymode = false
  higherFloor = 0
  points = 0
  combo = 0
  powerups: PowerupEntity[] = []

  constructor( x:number, y:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, {
      ...config,
      labels: [ `player` ],
      sprites: {
        idle: {
          src: playerIdleSprite.src,
        },
        falling: {
          src: playerFallingSprite.src,
        },
        moving: {
          src: playerSprite.src,
          framesCount: 3,
          framesPerColumn: 2,
          framesPerRow: 2,
        },
      },
      defaultSprite: `idle`,
      width: 30,
      height: 30,
    } )
    this.groundedOn = false
  }

  update( gameSpeedMultiplier:number, data:MovingEntityUpdateData ) {
    const isPressedLeft = Keys.isPressed( `left`, `a` )
    const isPressedRight = Keys.isPressed( `right`, `d` )
    const isPressedJump = Keys.isPressed( `space`, `w`, `up` )
    const isPressedDown = Keys.isPressed( `shiftleft`, `s`, `down` )
    const response:Record<string, string> = {}

    const speed = (!this.groundedOn ? PlayerEntity.fastSpeed : PlayerEntity.speed) * gameSpeedMultiplier
    const slowingSpeed = (this.velocity.x < PlayerEntity.fastSlowingTriggerVelocity
      ? PlayerEntity.fastSlowingSpeed
      : PlayerEntity.slowingSpeed
    ) * gameSpeedMultiplier

    if (this.flymode && isPressedDown) {
      this.y += 50
      this.points = 0
      this.combo = 0
    }

    if (isPressedJump && this.groundedOn) {
      if (this.flymode) this.y -= 50
      else {
        const isPressedDoubleJump = Keys.isPressed( `2` ) && this.getPowerup( `doubleJump` )
        const rand = Math.random()

        this.groundedOn = false

        const velocity = Math.abs( this.velocity.x )
        const jumpSpeed = (velocity > 50 ? -55
          : velocity > 40 ? -50
            : velocity > 25 ? -40
              : velocity > 10 ? -33
                : -27
        )

        this.velocity.y = jumpSpeed
        if (isPressedDoubleJump) {
          response.powerup = `consumed`
          this.velocity.y *= 2
        }

        if (rand > 0.5) sounds.jump1.play()
        else sounds.jump2.play()
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

    data.reactions = {
      terminator: () => `game over`,
      platform: ({ entity }, { bottom }) => {
        if (!(entity instanceof PlatformEntity) || !bottom) return
        return `${entity.floorIndex}`
      },
      powerup: ({ entity }) => {
        if (!(entity instanceof PowerupEntity)) return
        entity.owner = this
        this.powerups.push( entity )
        sounds.powerup.play()
        console.log( `POWERUP GRABBED` )
        return `powerum`
      },
    }

    if (this.velocity.y > 0) {
      this.sprite = this.moreSprites.falling
    } else if (this.velocity.x === 0) {
      this.sprite = this.moreSprites.idle
    } else {
      this.sprite = this.moreSprites.moving
      const frameTicksModulo = Math.abs( this.velocity.x ) > 20 ? 2
        : Math.abs( this.velocity.x ) ? 5
          : 10
      if (this.updatesCount % frameTicksModulo === 0) this.sprite?.nextFrame()
    }

    Object.assign( response, super.update( gameSpeedMultiplier, data ) )

    return response
  }

  draw({ ctx, ...config }:EntityDrawConfig) {
    super.draw({ ctx, ...config, scale: { x:-1 * Math.sign( this.velocity.x ) || 1 }, inTranslationDrawer: () => {
      if (this.flymode) {
        ctx.beginPath()
        ctx.arc( 0, 0, this.halfWidth * 1.5, 0, Math.PI * 2 )
        ctx.lineWidth = 5
        ctx.stroke()
      }
    } })
  }

  getPowerup( type:PowerupType ) {
    const powerupIndex = this.powerups.findIndex( p => p.type === type )
    if (powerupIndex === -1) return null

    const powerup = this.powerups[ powerupIndex ]

    this.powerups = [
      ...this.powerups.slice( 0, powerupIndex ),
      ...this.powerups.slice( powerupIndex + 1 ),
    ]

    return powerup
  }

  toggleFlyMode() {
    this.flymode = !this.flymode
    this.groundedOn = this.flymode
    this.velocity.y = 0
  }

  setNewHigherFloor( floor:number ) {
    if (this.higherFloor !== floor) {
      const diff = floor - this.higherFloor

      if (diff > 1) this.combo += diff
      else {
        this.points += this.combo ** 2 * 10
        this.combo = 0
      }
    }

    if (this.higherFloor >= floor) return false

    this.points += (floor - this.higherFloor) ** 2 * 10
    this.higherFloor = floor

    return true
  }
}
