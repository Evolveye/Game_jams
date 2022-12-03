import Sprite from "@lib/gameEngine/logic/Sprite"
import { LevelTileTemplate } from "@lib/gameEngine/logic/Level/Tile"
import Level from "@lib/gameEngine/logic/Level"
import spriteGroundworkSand from "../../img/groundwork-sand.png"
import spriteGrass from "../../img/grass.png"
import levelConfig01 from "./01"

const sprites = {
  grass: new Sprite( spriteGrass ),
  groundworkSand: new Sprite( spriteGroundworkSand ),
}

export const tileTemplates = [
  new LevelTileTemplate( `_`, sprites.grass, sprites.groundworkSand ),
  new LevelTileTemplate( `T`, sprites.grass, sprites.groundworkSand ),
]

export const levels = {
  island: new Level( tileTemplates, { tileSize:16, definition:levelConfig01 } ),
}
