import Game from "./engine.js"
import levels from "./levels.js"

const canvasHelperBgr = document.querySelector( `.canvas-helperBgr` )
const canvasHelperFgr = document.querySelector( `.canvas-helperFgr` )
const app = document.querySelector( `.app` )

const game = new Game( app, {
  playerId: `player`,
  actionId: `e`,
  levelsBuildingSpeed: .5,
  playerSpeed: 5
} )

const cache = game.storage.userData

canvasHelperBgr.width = window.innerWidth
canvasHelperBgr.height = window.innerWidth

canvasHelperFgr.width = window.innerWidth
canvasHelperFgr.height = window.innerWidth

cache.map_secondJam = new Image
cache.map_secondJam.src = `./img/map-second_jam.png`

cache.map_firstJam = new Image
cache.map_firstJam.src = `./img/map-first_jam.png`

game.createEntity( `./img/e.png` )
game.createEntity( `./img/player.png`, {
  classname: `Player`,
  sterable: true,
  canBePlacedOn: [ `floor`, `arrow`, `arrow-circle`, `lever`, `land`, `land-c1`, `land-c2`, `desert`, `lab` ]
} )

game.createEntity( `./img/lab.png` )
game.createEntity( `./img/monster.png`, { frames:3, framesInRow:2 } )
game.createEntity( `./img/bullet.png` )
game.createEntity( `./img/cactus.png` )

game.createEntity( `./img/cave/cave-0.0.0.0.png`, { connectable:true } )
game.createEntity( `./img/cave/cave-0.0.0.1.png` )
game.createEntity( `./img/cave/cave-0.0.1.0.png` )
game.createEntity( `./img/cave/cave-0.0.1.1.png` )
game.createEntity( `./img/cave/cave-0.1.0.0.png` )
game.createEntity( `./img/cave/cave-0.1.0.1.png` )
game.createEntity( `./img/cave/cave-0.1.1.0.png` )
game.createEntity( `./img/cave/cave-0.1.1.1.png` )
game.createEntity( `./img/cave/cave-1.0.0.0.png` )
game.createEntity( `./img/cave/cave-1.0.0.1.png` )
game.createEntity( `./img/cave/cave-1.0.1.0.png` )
game.createEntity( `./img/cave/cave-1.0.1.1.png` )
game.createEntity( `./img/cave/cave-1.1.0.0.png` )
game.createEntity( `./img/cave/cave-1.1.0.1.png` )
game.createEntity( `./img/cave/cave-1.1.1.0.png` )
game.createEntity( `./img/cave/cave-1.1.1.1.png` )

game.createEntity( `./img/lab/floor.png` )
game.createEntity( `./img/lab/wall.png` )
game.createEntity( `./img/lab/wall-c.png` )
game.createEntity( `./img/lab/wall-d.png` )
game.createEntity( `./img/lab/wall-w.png` )
game.createEntity( `./img/lab/wall-g.png` )
game.createEntity( `./img/lab/wall-t.png` )
game.createEntity( `./img/lab/glass.png` )
game.createEntity( `./img/lab/lever.png` )
game.createEntity( `./img/lab/gifts.png` )
game.createEntity( `./img/lab/pacman.png`, { frames:6, framesInRow:2 } )
game.createEntity( `./img/lab/greeny.png`, { frames:4, framesInRow:2 } )

game.createEntity( `./img/land/land-1000.png`, {
  canBePlacedOn: [ `water` ],
  connectable: true,
  connectedDirs: { top:true },
} )
game.createEntity( `./img/land/land-1001.png` )
game.createEntity( `./img/land/land-1010.png` )
game.createEntity( `./img/land/land-1011.png` )
game.createEntity( `./img/land/land-1100.png` )
game.createEntity( `./img/land/land-1101.png` )
game.createEntity( `./img/land/land-1110.png` )
game.createEntity( `./img/land/land-1111.png` )
game.createEntity( `./img/land/land-c1.png` )
game.createEntity( `./img/land/land-c2.png` )
game.createEntity( `./img/land/water.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/land/water-e.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/land/water-c.png`, { frames:11, framesInRow:3 } )
game.createEntity( `./img/land/water-a.png`, { frames:11, framesInRow:3 } )

game.createEntity( `./img/land/desert-1000.png`, {
  canBePlacedOn: [ `water` ],
  connectable: true,
  connectedDirs: { top:true },
} )
game.createEntity( `./img/land/desert-1001.png` )
game.createEntity( `./img/land/desert-1010.png` )
game.createEntity( `./img/land/desert-1011.png` )
game.createEntity( `./img/land/desert-1100.png` )
game.createEntity( `./img/land/desert-1101.png` )
game.createEntity( `./img/land/desert-1110.png` )
game.createEntity( `./img/land/desert-1111.png` )

game.createLevels( levels )

document.addEventListener( `DOMContentLoaded`, () => game.start( `flying1` ) )

window.game = game

setTimeout( () => window.p = game.player, 1000 )