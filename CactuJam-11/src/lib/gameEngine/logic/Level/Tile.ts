import Animation from "../Sprite/Animation"
import Sprite from "../Sprite"

export class LevelTile {
  templateId: string
  x: number
  y: number
  height: number
  animation: Animation
  groundworkAnimation: null | Animation = null

  constructor( templateId:string, x:number, y:number, height:number, sprite:Sprite, groundworkSprite:Sprite ) {
    this.templateId = templateId
    this.x = x
    this.y = y
    this.height = height
    this.animation = sprite.getAnimation()
  }

  draw = (ctx:CanvasRenderingContext2D) => {
    this.animation.draw( ctx, this.x, this.y )
  }
}

export class LevelTileTemplate {
  id: string
  sprite: Sprite
  groundworkSprite: Sprite

  constructor( id:string, sprite:Sprite, groundworkSprite:Sprite ) {
    this.id = id
    this.sprite = sprite
    this.groundworkSprite = groundworkSprite
  }

  getTile = (x:number, y:number, height:number) => {
    return new LevelTile( this.id, x, y, height, this.sprite, this.groundworkSprite )
  }
}
