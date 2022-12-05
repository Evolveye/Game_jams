import Sprite from "@lib/gameEngine/logic/Sprite"
import { LevelTileTemplate } from "@lib/gameEngine/logic/Level/Tile"
import { EntityTemplate } from "@lib/gameEngine/logic/Level/Entity"
import spriteWaterBlock from "../../img/water-block.png"
import spriteSunflower from "../../img/sunflower.png"
import spriteSnowBlock from "../../img/snow-block.png"
import spritePlayer from "../../img/player.png"
import spriteIceSpikes from "../../img/ice-spikes.png"
import spriteIceBlock from "../../img/ice-block.png"
import spriteGrassFlowersBlock from "../../img/grass-flowers-block.png"
import spriteGrassBlock from "../../img/grass-block.png"
import spriteAutumnGrass3Block from "../../img/grass-autumn3-block.png"
import spriteAutumnGrass2Block from "../../img/grass-autumn2-block.png"
import spriteAutumnGrass1Block from "../../img/grass-autumn1-block.png"
import spriteClip from "../../img/clip.png"

const sprites = {
  player: new Sprite( spritePlayer ),
  grassBlock: new Sprite( spriteGrassBlock ),
  grassFlowersBlock: new Sprite( spriteGrassFlowersBlock ),
  sunflower: new Sprite( spriteSunflower ),
  grassAutumnGrass1Block: new Sprite( spriteAutumnGrass1Block ),
  grassAutumnGrass2Block: new Sprite( spriteAutumnGrass2Block ),
  grassAutumnGrass3Block: new Sprite( spriteAutumnGrass3Block ),
  snowBlock: new Sprite( spriteSnowBlock ),
  iceSpikes: new Sprite( spriteIceSpikes ),
  waterBlock: new Sprite( spriteWaterBlock ),
  iceBlock: new Sprite( spriteIceBlock ),
  clip: new Sprite( spriteClip ),
}

export const templates = {
  // Entities
  player: new EntityTemplate( `p`, sprites.clip, {
    canStandOn: [ `_`, `_A1`, `_A2`, `_A3`, `_F`, `_W`, `I` ],
  } ),

  // Tiles
  sunflower: new LevelTileTemplate( `SF`, sprites.sunflower ),
  grassBlock: new LevelTileTemplate( `_`, sprites.grassBlock ),
  grassFlowersBlock: new LevelTileTemplate( `_F`, sprites.grassFlowersBlock ),
  grassAutumn1Block: new LevelTileTemplate( `_A1`, sprites.grassAutumnGrass1Block ),
  grassAutumn2Block: new LevelTileTemplate( `_A2`, sprites.grassAutumnGrass2Block ),
  grassAutumn3Block: new LevelTileTemplate( `_A3`, sprites.grassAutumnGrass3Block ),
  snowBlock: new LevelTileTemplate( `_W`, sprites.snowBlock ),
  iceSpikes: new LevelTileTemplate( `IS`, sprites.iceSpikes ),
  waterBlock: new LevelTileTemplate( `W`, sprites.waterBlock, { translation:{ y:-10 } } ),
  iceBlock: new LevelTileTemplate( `I`, sprites.waterBlock ),
}
