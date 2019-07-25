import Game from "./engine.js"
import levels from "./levels.js"

const game = new Game( document.body, { levelsBuildingSpeed:.5, playerSpeed:5 } )

// createSprite( `e`, `./img/empty.png` )
game.createEntity( `e`, `./img/empty.png` )
game.createEntity( `>`, `./img/arrow.png` )
game.createEntity( `R`, `./img/restart.png` )

// Lab
game.createEntity( `p`, `./img/player.gif`, {
  src: `./img/player.png`,
  frames: 6,
  framesInRow: 2,
  canBePlacedOn: [ `lb0`, `>`, `R` ]
} )
game.createEntity( `lb0`, `./img/lab-bgr.png` )
game.createEntity( `lw0`, `./img/wall.png` )
game.createEntity( `lw1`, `./img/window.png` )
game.createEntity( `lw2`, `./img/door.png` )
game.createEntity( `lc`, `./img/cornerA.png` )

// Stage I - Island
game.createEntity( `ib0`, `./img/island-b0.png`, { frames:11, framesInRow:3 } )
game.createEntity( `ib1-1000`, `./img/island-b1-1000.png`, {
  canBePlacedOn: [ `ib0`,`cp.l`,`cp.r`,`cp.t`,`cp.b`,`cBaby`,`c` ],
  connectable: true,
  connectedDirs: { top:true },
  classname:`Land`
} )
game.createEntity( `ib1-1001`, `./img/island-b1-1001.png` )
game.createEntity( `ib1-1010`, `./img/island-b1-1010.png` )
game.createEntity( `ib1-1011`, `./img/island-b1-1011.png` )
game.createEntity( `ib1-1100`, `./img/island-b1-1100.png` )
game.createEntity( `ib1-1101`, `./img/island-b1-1101.png` )
game.createEntity( `ib1-1110`, `./img/island-b1-1110.png` )
game.createEntity( `ib1-1111`, `./img/island-b1-1111.png` )
game.createEntity( `ib2.0`, `./img/island-b2-0.png` )
game.createEntity( `ib2.1`, `./img/island-b2-1.png` )
game.createEntity( `ib2.2`, `./img/island-b2-2.png` )
game.createEntity( `ib2.3`, `./img/island-b2-3.png` )
game.createEntity( `ib3.0`, `./img/island-b3-0.png` )
game.createEntity( `iw`, `./img/island-w0.png`, { frames:11, framesInRow:3 } )
game.createEntity( `ic`, `./img/island-c0.png`, { frames:11, framesInRow:3 } )
game.createEntity( `ia`, `./img/island-a0.png`, { frames:11, framesInRow:3 } )
game.createEntity( `c`, `./img/island-cactus.png`, { classname:`Cactus`, canBePlacedOn:[ `ib0`, `ib1` ] } )
game.createEntity( `cBig`, `./img/island-cactus-big.png` )
game.createEntity( `cbl.0000`, `./img/island-cactus-bloomed-0000.png` )
game.createEntity( `cbl.1000`, `./img/island-cactus-bloomed-1000.png` )
game.createEntity( `cbl.0100`, `./img/island-cactus-bloomed-0100.png` )
game.createEntity( `cbl.0010`, `./img/island-cactus-bloomed-0010.png` )
game.createEntity( `cbl.0001`, `./img/island-cactus-bloomed-0001.png` )
game.createEntity( `cp.l`, `./img/island-cactus-part-left.png`, { classname:`Cactus` } )
game.createEntity( `cp.r`, `./img/island-cactus-part-right.png`, { classname:`Cactus` } )
game.createEntity( `cp.t`, `./img/island-cactus-part-top.png`, { classname:`Cactus` } )
game.createEntity( `cp.b`, `./img/island-cactus-part-bottom.png`, { classname:`Cactus` } )
game.createEntity( `cBaby`, `./img/island-cactus-baby.png` )
game.createEntity( `if`, `./img/island-flower.png`, { classname:`MagicFlower` } )
game.createEntity( `iAnimal`, `./img/island-animal.png`, { classname:`Animal`, canBePlacedOn:[ `ib1`, `ib2.0`, `ib2.1`, `ib2.2` ] } )
game.createEntity( `iPlague`, `./img/island-plague.png`, { classname:`Plague`, canBePlacedOn:[ `ib1`, `ib2.0`, `ib2.1`, `ib2.2` ] } )
// createEntity( `c`, `./img/island-cactus.png`, { canBePlacedOn: [ `ib0` ] } )
// createEntity( `c`, `./img/island-cactus.png`, { canBePlacedOn: [ `ib0` ] } )

// // Lab
// createImage( `player`, `./img/player.gif`, `p`, [ `ib0` ] )
// createSprite( `p`, `./img/player.png`, { frames:6, framesInRow:2 } )
// createSprite( `lb0`, `./img/lab-bgr.png` )
// createSprite( `lw0`, `./img/wall.png` )
// createSprite( `lw1`, `./img/window.png` )
// createSprite( `lc`, `./img/cornerA.png` )
// createSprite( `e`, `./img/empty.png` )

// // Stage 1
// createSprite( `ib0`, `./img/island-b0.png`, { frames:11, framesInRow:3 } )
// createSprite( `iw`, `./img/island-w0.png`, { frames:11, framesInRow:3 } )
// createSprite( `ic`, `./img/island-c0.png`, { frames:11, framesInRow:3 } )
// createSprite( `ia`, `./img/island-a0.png`, { frames:11, framesInRow:3 } )


game.createLevels( levels )

document.addEventListener( `DOMContentLoaded`, () => game.start( `lobby` ) )

window.game = game