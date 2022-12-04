import Sprite from "@lib/gameEngine/logic/Sprite"
import { LevelTileTemplate } from "@lib/gameEngine/logic/Level/Tile"
import { EntityTemplate } from "@lib/gameEngine/logic/Level/Entity"
import spriteRoadBlock from "../../img/road-block.png"
import spritePlayer from "../../img/player.png"
import spriteGroundworkSand from "../../img/groundwork-sand.png"
import spriteGroundworkSandLeft from "../../img/groundwork-sand-left.png"
import spriteGroundworkSandBottom from "../../img/groundwork-sand-bottom.png"
import spriteGrass from "../../img/grass.png"
import spriteGrassBlock from "../../img/grass-block.png"

const sprites = {
  player: new Sprite( spritePlayer ),
  grass: new Sprite( spriteGrass ),
  grassBlock: new Sprite( spriteGrassBlock ),
  groundworkSand: new Sprite( spriteGroundworkSand ),
  groundworkSandLeft: new Sprite( spriteGroundworkSandLeft ),
  groundworkSandBottom: new Sprite( spriteGroundworkSandBottom ),
  roadBlock: new Sprite( spriteRoadBlock ),
}

export const templates = {
  // Entities
  player: new EntityTemplate( `p`, sprites.player, {
    canStandOn: [ `_` ],
  } ),

  // Tiles
  grass: new LevelTileTemplate( `X`, sprites.grass, {
    directionalGroundworkSprites: ({ s, w }) => {
      if (!s && !w) return sprites.groundworkSand
      if (!s) return sprites.groundworkSandBottom
      if (!w) return sprites.groundworkSandLeft
    },
  } ),
  grassBlock: new LevelTileTemplate( `_`, sprites.grassBlock ),
  roadBlock: new LevelTileTemplate( `#`, sprites.roadBlock, { translation:{ y:-10 } } ),
}
