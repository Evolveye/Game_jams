import Game from "./engine.js"
import levels from "./levels.js"

const game = new Game( document.body, {
  playerId: `player`,
  actionId: `empty`,
  levelsBuildingSpeed: .5,
  playerSpeed: 5
} )

// createSprite( `e`, `./img/empty.png` )
game.createEntity( `./img/empty.png` )
game.createEntity( `./img/arrow.png` )
game.createEntity( `./img/arrow-circle.png` )

// Lab
game.createEntity( `./img/player-icon.gif`, {
  src: `./img/player.png`,
  classname: `Player`,
  frames: 6,
  framesInRow: 2,
  canBePlacedOn: [ `floor`, `arrow`, `arrow-circle` ]
} )
game.createEntity( `./img/floor.png` )
game.createEntity( `./img/wall.png` )
game.createEntity( `./img/wall-window.png` )
game.createEntity( `./img/wall-door.png` )
game.createEntity( `./img/wall-corner.png` )

// Stage I - Island
game.createEntity( `./img/land-1000.png`, {
  canBePlacedOn: [ `water`,`cactus-part-left`,`cactus-part-right`,`cactus-part-top`,`cactus-part-bottom`,`cactus-baby`,`cactus` ],
  connectable: true,
  connectedDirs: { top:true },
  classname:`Land`
} )
game.createEntity( `./img/land-1001.png` )
game.createEntity( `./img/land-1010.png` )
game.createEntity( `./img/land-1011.png` )
game.createEntity( `./img/land-1100.png` )
game.createEntity( `./img/land-1101.png` )
game.createEntity( `./img/land-1110.png` )
game.createEntity( `./img/land-1111.png` )
game.createEntity( `./img/land-cactus-0.png` )
game.createEntity( `./img/land-cactus-1.png` )
game.createEntity( `./img/land-cactus-2.png` )
game.createEntity( `./img/land-cactus-3.png` )
game.createEntity( `./img/land-plague.png` )
game.createEntity( `./img/water.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/water-end.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/water-corner.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/water-aside.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/cactus.png`, { classname:`Cactus`, canBePlacedOn:[ `land`, `water` ] } )
game.createEntity( `./img/cactus-big.png` )
game.createEntity( `./img/cactus-bloomed-0000.png` )
game.createEntity( `./img/cactus-bloomed-1000.png` )
game.createEntity( `./img/cactus-bloomed-0100.png` )
game.createEntity( `./img/cactus-bloomed-0010.png` )
game.createEntity( `./img/cactus-bloomed-0001.png` )
game.createEntity( `./img/cactus-part-left.png`, { classname:`Cactus` } )
game.createEntity( `./img/cactus-part-right.png`, { classname:`Cactus` } )
game.createEntity( `./img/cactus-part-top.png`, { classname:`Cactus` } )
game.createEntity( `./img/cactus-part-bottom.png`, { classname:`Cactus` } )
game.createEntity( `./img/cactus-baby.png` )
game.createEntity( `./img/flower.png`, { classname:`MagicFlower` } )
game.createEntity( `./img/animal.png`, { classname:`Animal`, canBePlacedOn:[ `land`, `land-cactus-0`, `land-cactus-1`, `land-cactus-2` ] } )
game.createEntity( `./img/plague.png`, { classname:`Plague`, canBePlacedOn:[ `land`, `land-cactus-0`, `land-cactus-1`, `land-cactus-2` ] } )
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