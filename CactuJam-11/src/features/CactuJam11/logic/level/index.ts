import Sprite from "@lib/gameEngine/logic/Sprite"
import { LevelTileTemplate } from "@lib/gameEngine/logic/Level/Tile"
import { EntityTemplate } from "@lib/gameEngine/logic/Level/Entity"
import spritePlayer from "../../img/player.png"
import spriteGroundworkSand from "../../img/groundwork-sand.png"
import spriteGrass from "../../img/grass.png"

const sprites = {
  player: new Sprite( spritePlayer ),
  grass: new Sprite( spriteGrass ),
  groundworkSand: new Sprite( spriteGroundworkSand ),
}

export const templates = {
  // Entities
  player: new EntityTemplate( `p`, sprites.player, {
    canStandOn: [ `_` ],
  } ),

  // Tiles
  grass: new LevelTileTemplate( `_`, sprites.grass, sprites.groundworkSand ),
}
