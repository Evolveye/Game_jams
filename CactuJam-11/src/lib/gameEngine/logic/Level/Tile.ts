import Animation from "../Sprite/Animation"
import Sprite from "../Sprite"
import LevelBeingTemplate from "./LevelBeing"

export class LevelTile {
  templateId: string
  x: number
  y: number
  height: number
  animation: Animation
  groundworkAnimation: Animation

  constructor( templateId:string, x:number, y:number, height:number, sprite:Sprite, groundworkSprite:Sprite ) {
    this.templateId = templateId
    this.x = x
    this.y = y
    this.height = height
    this.animation = sprite.getAnimation()
    this.groundworkAnimation = groundworkSprite.getAnimation()
  }

  draw = (ctx:CanvasRenderingContext2D, size:number) => {
    const { x, y } = this

    this.animation.draw( ctx, x * size, y * size, size, size )
  }
}

export class LevelTileTemplate extends LevelBeingTemplate {
  groundworkSprite: Sprite

  constructor( id:string, sprite:Sprite, groundworkSprite:Sprite ) {
    super( id, sprite )

    this.groundworkSprite = groundworkSprite
  }

  createTile = (x:number, y:number, height:number) => {
    return new LevelTile( this.id, x, y, height, this.sprite, this.groundworkSprite )
  }
}
