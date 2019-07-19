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

createSprite( `p`, `./img/player.png`, { frames:6, framesInRow:2 } )
createSprite( `f0`, `./img/gate.png` )
createSprite( `b0`, `./img/bgr.png` )
createSprite( `c`, `./img/circle-0000.png`, { connectable:true } )
createSprite( `c`, `./img/circle-0001.png` )
createSprite( `c`, `./img/circle-0100.png` )

createLevel( levels )

createAdditionalLogic( () => console.log( 1 ) )
createAdditionalDraw( () => {} )

document.addEventListener( `DOMContentLoaded`, () => start() )