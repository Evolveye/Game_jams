import Sprite from "../Sprite"

export default abstract class LevelBeingTemplate {
  id: string
  sprite: Sprite

  constructor( id:string, sprite:Sprite ) {
    this.id = id
    this.sprite = sprite
  }
}
