import Game from "./engine.js"
import levels from "./levels.js"

const canvasHelper = document.querySelector( `.canvas-helper` )
const app = document.querySelector( `.app` )

const game = new Game( app, {
  playerId: `player`,
  actionId: `empty`,
  levelsBuildingSpeed: .5,
  playerSpeed: 5
} )

const cache = game.storage.userData

canvasHelper.width = window.innerWidth
canvasHelper.height = window.innerWidth

cache.map_secondJam = new Image
cache.map_secondJam.src = `./img/map-second_jam.png`

cache.map_firstJam = new Image
cache.map_firstJam.src = `./img/map-first_jam.png`

game.createEntity( `./img/monster.png`, { frames:3, framesInRow:2 } )
game.createEntity( `./img/cave/cave-0000.png`, { connectable:true } )

game.createLevels( levels )

document.addEventListener( `DOMContentLoaded`, () => game.start( `intro` ) )

window.game = game