import { EntityConfig, EntityDrawConfig } from "./Entity"
import MovingEntity from "./MovingEntity"
import platformSprite from "./platform.png"
import terminatorPlatformSprite from "./platform-terminator.png"

export class PlatformEntity extends MovingEntity {
  floorIndex: number

  constructor( x:number, y:number, width:number, height:number, floorIndex:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, {
      ...config,
      width,
      height,
      labels: [ `stop-top`, `platform` ],
      sprites: {
        platform: {
          src: platformSprite.src,
        },
      },
      defaultSprite: `platform`,
    } )
    this.floorIndex = floorIndex
  }

  draw({ ctx, ...config }: EntityDrawConfig) {
    super.draw({ ctx, ...config, inTranslationDrawer: () => {
      ctx.fillStyle = `brown`
      ctx.font = `bold 32px consolas`
      ctx.fillText( `${this.floorIndex}`.padStart( 4, ` ` ), -this.x - 70, 0 )
    } })
  }
}

export class TerminationPlatformEntity extends MovingEntity {
  constructor( x:number, y:number, width:number, height:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, {
      ...config,
      width,
      height,
      labels: [ `stop-top`, `terminator` ],
      sprites: {
        terminator: {
          src: terminatorPlatformSprite.src,
        },
      },
      defaultSprite: `terminator`,
    } )
  }
}

export class WallEntity extends MovingEntity {
  constructor( x:number, y:number, width:number, height:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    // super( x, y, { ...config, width, height, labels:[ `stop` ], boudingBoxColor:`brown` } )
    super( x, y, { ...config, width, height, labels:[ `stop` ] } )
  }
}
