import Level from "@lib/gameEngine/logic/Level"
import CactuJam11Game from ".."
import { templates } from "."

export const level01 = new Level<CactuJam11Game>( templates, { tileSize: 64, variant: `isometric`, definition: {
  tiles: [
    // // /* - - - 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 */
    // /* 0 */ `_`,
    // /* 1 */ `  _   _`,
    // /* 2 */ `_ _ _ _ _`,

    // /* - - - 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 */
    // /* 0 */ `          _ _ _`,
    // /* 1 */ `    _ _ _ _ _ _ _ _`,
    // /* 2 */ `  _ _ _ _ _ _,_ _ _ _ _ _`,
    // /* 3 */ `_ _ _ _ # _,# _,# _,_ _ _ _ _`,
    // /* 4 */ `_ _ _ # # _ _ _ _ _ _ _`,
    // /* 5 */ `_ _ # # _ _ _ _ _,_ _ _ _`,
    // /* 6 */ `_ # # _ _ _ _,_ _ _,_ _ _ _`,
    // /* 7 */ `  # _ _ _ _ _ _ _ _,_ _,_ _`,
    // /* 8 */ `  _ _ _ _ _ _ _ _ _ _ _ _`,
    // /* 9 */ `    _ _ _ _ _ _ _ _ _ _`,
    // /* 0 */ `        _ _ _ _ _`,
  ],
  script: level => {
    // level.spawnBeing( 6, 6, templates.player )
  },
} } )
