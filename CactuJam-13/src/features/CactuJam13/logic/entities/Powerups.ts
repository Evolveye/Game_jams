import makeEnum from "@/lib/core/functions/makeEnum"
import { EntityConfig } from "./Entity"
import MovingEntity, { MovingEntityUpdateData } from "./MovingEntity"
import { PlayerEntity } from "./Player"
import doubleJumpImg from "./powerup-doubleJump.png"
import widePlatformsImg from "./powerup-widePlatforms.png"

export { doubleJumpImg, widePlatformsImg }

export const PowerupType = makeEnum( [ `doubleJump`, `widePlatforms` ] as const )
export type PowerupType = keyof typeof PowerupType

export class PowerupEntity extends MovingEntity {
  owner: null | PlayerEntity = null
  type: PowerupType

  constructor( x:number, y:number, type:PowerupType, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, {
      ...config,
      width: 20,
      height: 20,
      labels: [ `powerup` ],
      sprites: {
        doubleJump: {
          src: doubleJumpImg.src,
        },
        widePlatforms: {
          src: widePlatformsImg.src,
        },
      },
      defaultSprite: type === `doubleJump` ? `doubleJump` : `widePlatforms`,
    } )

    this.type = type
  }

  update( gameSpeedMultiplier: number, data?:MovingEntityUpdateData ) {
    return super.update( gameSpeedMultiplier, data )
  }
}
