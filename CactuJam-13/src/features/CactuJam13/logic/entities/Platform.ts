import { EntityConfig } from "./Entity"
import MovingEntity from "./MovingEntity"

export class PlatformEntity extends MovingEntity {
  floorIndex: number

  constructor( x:number, y:number, width:number, height:number, floorIndex:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, { ...config, width, height, labels:[ `platform` ], boudingBoxColor:`red` } )
    this.floorIndex = floorIndex
  }
}

export class WallEntity extends MovingEntity {
  constructor( x:number, y:number, width:number, height:number, config:Pick<EntityConfig, `sizeMultiplier`> = {} ) {
    super( x, y, { ...config, width, height, labels:[ `wall` ], boudingBoxColor:`brown` } )
  }
}
