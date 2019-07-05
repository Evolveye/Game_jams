import {
  setup,
  start,
  stop,
  createAdditionalLogic,
  createAdditionalDraw,
  createSprite,
  Sprite,
  createLevel
} from "./engine"
import levels from "./levels"

setup( {} )

createSprite( `f0`, {
  src: `./img/sprite.png`,
  frames: 1,
  framesInRow: 1
} )

createLevel( levels )

createAdditionalLogic( () => console.log( 1 ) )
createAdditionalDraw( () => {} )

document.addEventListener( `DOMContentLoaded`, () => start() )