import { randomInt } from "@/lib/core/functions/numberUtils"
import { EntityConfig } from "./Entity"
import MovingEntity, { MovingEntityUpdateData } from "./MovingEntity"
import mayImg from "./may.png"

export class MayEntity extends MovingEntity {
  constructor( x:number, y:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    // super( x, y, { ...config, labels:[ `enemy`, `may` ], spriteSrc:mayImg.src } )
    super( x, y, {
      ...config,
      labels: [ `terminator`, `enemy`, `may` ],
      sprites: {
        may: {
          src: mayImg.src,
          framesCount: 4,
          framesPerColumn: 2,
          framesPerRow: 2,
        },
      },
      width: 50,
      height: 50,
      defaultSprite: `may`,
    } )

    this.gravity = 0.9
  }
  update( gameSpeedMultiplier: number, data:MovingEntityUpdateData ) {
    if (this.groundedOn) {
      this.groundedOn = false
      this.velocity.y = randomInt( -15, -10 )
    }

    if (Math.abs( this.velocity.x ) < 1) {
      this.velocity.x = randomInt( 1, 6 ) * Math.sign( this.velocity.x || Math.random() - 0.5 )
    }

    if (this.updatesCount % 10 === 0) this.sprite?.nextFrame()

    return super.update( gameSpeedMultiplier, data )
  }
}
