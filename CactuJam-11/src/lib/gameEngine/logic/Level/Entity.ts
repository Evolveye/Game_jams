import Animation from "../Sprite/Animation"
import Sprite from "../Sprite"
import LevelBeingTemplate from "./LevelBeing"

export type EntityConfig = {
  canStandOn?: string[]
}

export default class Entity {
  templateId: string
  x: number
  y: number
  scale: number
  animation: Animation
  canStandOn: string[]

  constructor( templateId:string, x:number, y:number, scale:number, sprite:Sprite, { canStandOn = [] }:EntityConfig = {} ) {
    this.templateId = templateId
    this.x = x
    this.y = y
    this.scale = scale
    this.animation = sprite.getAnimation()
    this.canStandOn = canStandOn
  }

  draw = (ctx:CanvasRenderingContext2D, tileSize:number) => {
    const { x, y, scale } = this
    // this.animation.draw( ctx, this.x * tileSize, this.y * tileSize, tileSize * this.scale, tileSize * this.scale )

    this.animation.draw( ctx,
      x * tileSize,
      y * (tileSize / 2 - 10) - /* layer */ 1 * (tileSize / 2 - 10), // - (this.config.translation?.y ?? 0),
      tileSize, tileSize,
    )
  }
}

export class EntityTemplate extends LevelBeingTemplate {
  canStandOn: string[]

  constructor( id:string, sprite:Sprite, { canStandOn = [] }:EntityConfig = {} ) {
    super( id, sprite )

    this.canStandOn = canStandOn
  }

  createEntity = (x:number, y:number, scale:number) => {
    return new Entity( this.id, x, y, scale, this.sprite, {
      canStandOn: this.canStandOn,
    } )
  }
}
