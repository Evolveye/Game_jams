import Game from "./engine.js"
import levels from "./levels.js"

const app = document.querySelector( `.app` )

const game = new Game( app, {
  playerId: `player`,
  actionId: `e`,
  levelsBuildingSpeed: .5,
  playerSpeed: 5
} )

const cache = game.storage.userData

cache.map_secondJam = new Image
cache.map_secondJam.src = `./img/map-second_jam.png`

cache.map_firstJam = new Image
cache.map_firstJam.src = `./img/map-first_jam.png`

cache.fightingEye = new Image
cache.fightingEye.src = `./img/fighting_eye.png`

cache.grass = new Image
cache.grass.src = `./img/grass.png`

cache.wav_newMsg = new Audio( `./new_msg.wav` )
cache.wav_intro = new Audio( `./intro.wav` )
cache.wav_end = new Audio( `./end.wav` )
cache.wav_lab = new Audio( `./lab.wav` )
cache.wav_lab.loop = true
cache.wav_map = new Audio( `./map.wav` )
cache.wav_map.loop = true
cache.wav_fightAndFlying = new Audio( `./fight_and_flying.wav` )
cache.wav_fightAndFlying.loop = true

game.createEntity( `./img/e.png` )
game.createEntity( `./img/player.png`, {
  classname: `Player`,
  sterable: true,
  canBePlacedOn: [
    `e`,
    `floor`,
    `arrow`,
    `arrow-circle`,
    `lever`,
    `land`,
    `land-c1`,
    `land-c2`,
    `heli-b`,
    `snow`,
    `desert`,
    `lab`
  ]
} )
game.createEntity( `./img/heli.png`, {
  classname: `Player`,
  sterable: true,
  frames: 4,
  framesInRow: 2,
  canBePlacedOn: [
    `e`,
    `floor`,
    `arrow`,
    `arrow-circle`,
    `lever`,
    `land`,
    `land-c1`,
    `land-c2`,
    `heli-b`,
    `snow`,
    `desert`,
    `lab`
  ]
} )

game.createEntity( `./img/lab.png` )
game.createEntity( `./img/monster.png`, {
  frames: 3,
  framesInRow: 2,
  canBePlacedOn:[ `cactus`, `heli-b`, `cactus-b`, `mntn` ]
} )
game.createEntity( `./img/bullet.png` )
game.createEntity( `./img/cactus.png` )
game.createEntity( `./img/cactus-b.png` )
game.createEntity( `./img/brick.png` )
game.createEntity( `./img/big_bullet.png` )
game.createEntity( `./img/bullet_ufo.png`, { canBePlacedOn:[ `cactus`, `heli-b`, `cactus-b` ] } )
game.createEntity( `./img/mntn.png` )
game.createEntity( `./img/ranfin.png` )
game.createEntity( `./img/coin.png` )
game.createEntity( `./img/profesor.png` )

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
game.createEntity( `./img/pacman-icon.gif`, { src:`./img/lab/pacman.png`, frames:6, framesInRow:2 } )
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
game.createEntity( `./img/land/water.png`, { frames:6, framesInRow:2 } )
game.createEntity( `./img/land/water-e.png`, { frames:6, framesInRow:2 } )
game.createEntity( `./img/land/water-c.png`, { frames:6, framesInRow:2 } )
game.createEntity( `./img/land/water-a.png`, { frames:6, framesInRow:2 } )
game.createEntity( `./img/land/snow.png` )
game.createEntity( `./img/land/heli-b.png` )

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

document.addEventListener( `DOMContentLoaded`, () => {
  // cache.map_run = 2
  // game.start( `lab` )
 } )

window.game = game

setTimeout( () => window.p = game.player, 1000 )