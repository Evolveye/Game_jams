import {
  KeyInfo,
  Level,
  SpriteInfo,
  Sprite,
  Entity,
  InventoryItem,
  Player,
  Icon
} from "./engine-classes.js"
import {
  Cactus,
  Land,
  MagicFlower,
  Animal,
  Plague
} from "./island.js"

const Game = {
  ui: {
    /** @type {HTMLCanvasElement} */
    canvas: null,
    /** @type {HTMLDivElement} */
    dialogues: null,
    /** @type {HTMLButtonElement} */
    canDoAction: null,
    /** @type {HTMLDivElement} */
    inventory: null,
  },

  config: {
    userLogic() {},
    userDraw() {},
    /** @type {Number} */
    levelsBuildingSpeed: null,
    /** @type {Number} */
    playerSpeed: null,
    /** @type {Number} */
    playerSize: null,
    /** @type {Number} */
    loopIntervalId: null,
    /** @type {Number} */
    tileSize: null,
    /** @type {String} */
    playerId: null,
    /** @type {Number} */
    nextFrameTicks: 5,
  },
  storage: {
    /** @type {Map<String,Sprite>} */
    sprites: new Map,
    /** @type {Map<String,Icon>} */
    icons: new Map,
    /** @type {Level[]} */
    levels: [],
  },
  classes: {
    Player,
    Entity,
    Cactus,
    Land,
    MagicFlower,
    Animal,
    Plague
  },

  /** @type {Player} */
  player: null,
  /** @type {Level} */
  level: null,
  /** @type {Icon} */
  chosedItem: null,
  /** @type {Boolean} */
  canDoAction: null,
  /** @type {Number} */
  ticksToNextFrame: 0,
  /** @type {CanvasRenderingContext2D} */
  ctx: null,
  /** @type {KeyInfo[]} */
  keys: [],
  /** @type {Boolean} */
  running: null
}

// *
//
//

function setup( { tileSize=50, playerSize=1, playerId=`p`, playerSpeed=1, levelsBuildingSpeed=5 } ) {
  document.body.innerHTML = /* html */ `
    <canvas class="game-canvas"></canvas>
    <article class="game-dialogues"></article>
    <article class="game-inventory"></article>
    <button class="game-box game-canDoAction">Wciśnij spację!</button>
  `

  Game.config.tileSize = tileSize
  Game.config.playerId = playerId
  Game.config.playerSize = tileSize * playerSize
  Game.config.playerSpeed = playerSpeed
  Game.config.levelsBuildingSpeed = levelsBuildingSpeed

  Game.ui.canvas = document.body.querySelector( `.game-canvas` )
  Game.ui.dialogues = document.body.querySelector( `.game-dialogues` )
  Game.ui.canDoAction = document.body.querySelector( `.game-canDoAction` )
  Game.ui.inventory = document.body.querySelector( `.game-inventory` )
  Game.ui.canDoAction.addEventListener( `click`, () => doAction() )
  Game.ctx = Game.ui.canvas.getContext( `2d` )
  Game.running = false

  Game.ui.canvas.width = window.innerWidth
  Game.ui.canvas.height = window.innerHeight
  Game.ctx.imageSmoothingEnabled = false

  document.body.addEventListener( `keydown`, ({ keyCode }) => key( keyCode ).pressed = true )
  document.body.addEventListener( `keyup`, ({ keyCode }) => key( keyCode ).pressed = false )
  Game.ctx.canvas.addEventListener( `click`, ({ clientX, clientY }) => {
    const { level } = Game
    const { tileSize } = Game.config

    const x = Math.floor( (clientX - (window.innerWidth - level.width * tileSize) / 2) / tileSize )
    const y = Math.floor( (clientY - (window.innerHeight - level.height * tileSize) / 2) / tileSize )
    const tileTop = level.getTop( x, y )

    if ( tileTop == null ) return

    tileTop.onclick( level, Game.storage.sprites, createTile, inventory )

    console.log( level.get( x, y ) )

    placeItem( x, y )
  } )
}
function start() {
  Game.config.loopIntervalId = setInterval( () => loop(), 1000 / 60 )
}
function stop() {
  clearInterval( Game.config.loopIntervalId )
}
function loop() {
  logic()
  Game.config.userLogic()
  requestAnimationFrame( () => draw() )
  requestAnimationFrame( () => Game.config.userDraw() )
}
function logic() {
  const { level, running, ticksToNextFrame, player } = Game
  const { levels } = Game.storage
  const { nextFrameTicks } = Game.config
  const { canDoAction } = Game.ui

  if ( !level && levels.length ) buildLevel( 0 ).then( () => Game.running = true )
  if ( !running || !player ) return

  const playerTile = level.get( player.tileX, player.tileY )

  if ( playerTile.some( tile => tile.id == `e` ) ) {
    canDoAction.classList.add( `is-active` )
    Game.canDoAction = true
  }
  else {
    Game.canDoAction = false
    canDoAction.classList.remove( `is-active` )
  }

  // Sprites animating
  if ( ticksToNextFrame == nextFrameTicks ) {
    Game.ticksToNextFrame = 0

    for ( const { entity } of level.everyEntity() )
      entity.nextFrame()
  }
  else Game.ticksToNextFrame++
}
function draw() {
  const { ctx, level } = Game
  const { tileSize } = Game.config

  if ( !level ) return

  ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

  const translateX = window.innerWidth / 2 - level.width * tileSize / 2
  const translateY = window.innerHeight / 2 - level.height * tileSize / 2

  for ( const { x, y, entity } of level.everyButNotIds( `p` ) )
    entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )

  for ( const { x, y, entity } of level.everyId( `p` ) )
    entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )
}
function key( key ) {
  if ( !Game.keys[ key ] ) Game.keys[ key ] = new KeyInfo( key )

  return Game.keys[ key ]
}

// *
//
//

async function buildLevel( levelNumber=Game.level.number ) {
  const lastState = Game.running
  const level = Game.storage.levels[ levelNumber ]
  const indices = []

  for ( const { x, y, l, entity } of level.everyEntity() ) {
    if ( typeof entity != `string` ) {
      if ( entity.id == Game.config.playerId ) Game.player = entity
      indices.push( { x, y } )
      continue
    }
    const { spriteId, rotateAngle } = entity.match( /(?<spriteId>[^-]+)(?:-(?<rotateAngle>[^-]+))?/ ).groups
    const tile = createTile( spriteId, x, y, l, rotateAngle )

    if ( !tile ) continue

    indices.push( { x, y } )
    level.tiles[ y ][ x ][ l ] = tile

    if ( tile.id == Game.config.playerId ) Game.player = tile
  }

  const tiles = level.tiles
  const timePerTile = Game.config.levelsBuildingSpeed / indices.length

  level.tiles = Array.from( { length:tiles.length }, (_, i) => Array.from( { length:tiles[ i ].length }, _ => [] ) )

  const builderHelper = () => new Promise( resolve => {
    if ( !indices.length ) resolve()

    const index = Math.floor( Math.random() * indices.length )
    const { x, y } = indices[ index ]

    level.tiles[ y ][ x ] = tiles[ y ][ x ].filter( entity => typeof entity != "string" )

    indices.splice( index, 1 )

    setTimeout( () => builderHelper().then( () => resolve() ), timePerTile * 1000 )
  } )

  Game.level = level
  Game.running = lastState

  await builderHelper()

  level.script( {
    inventory,
    createDialog,
    buildLevel,
    createTile,
    Game,
    levelRestart,
    levelBuild
  } )
}
function doAction() {
  const { canDoAction, player, level } = Game
  const { tileX, tileY } = player
  const playerTile = level.get( tileX, tileY )

  if ( !canDoAction || !playerTile || !playerTile.some( tile => tile.id == `e` ) ) return

  let eventInOrder = 0

  for ( const { x, y, entity } of level.everyId( `e` ) )
    if ( x != tileX || y != tileY ) eventInOrder++
    else break

  level.events( eventInOrder, {
    inventory,
    createDialog,
    buildLevel,
    createTile,
    Game,
    levelRestart,
    levelBuild
  } )
}
function levelRestart() {
}
function levelBuild( num ) {
  Game.storage.levels[ num ].runCounter++
  Game.running = false
  buildLevel( num ).then( () => Game.running = true )
}
/** Add, remove, or set amount of items in player inventory
 * @param {"add"|"remove"|"set"} action
 * @param {String} name
 * @param {Number} count
 * @param {Boolean} hide
 */
function inventory( action, id, count, hide=false ) {
  const { player, ui } = Game
  const { icons } = Game.storage

  switch ( action ) {
    case `add`: {
      const item = player.inventory.find( item => item.id == id )

      if ( item ) {
        item.count += count
        ui.inventory.querySelector( `[data-item-id=${id}] .game-inventoryItemCount` ).textContent = item.count
        break
      }
    }
    case `set`: {
      player.inventory.push( new InventoryItem( id, count ) )

      const div = document.createElement( `div` )
      const p = document.createElement( `p` )
      const image = id && icons.has( id ) ? icons.get( id ).node.cloneNode() : null

      p.textContent = count
      image.alt = id

      image.classList.add( `game-inventoryItemIcon` )
      p.classList.add( `game-inventoryItemCount` )
      div.classList.add( `game-inventoryItem` )
      div.classList.add( `game-box` )
      div.dataset.itemId = id

      div.appendChild( p )
      div.appendChild( image )

      div.addEventListener( `click`, () => updateInventory( div ) )

      ui.inventory.appendChild( div )
    } break
    case `remove`: {
      const item = player.inventory.find( item => item.id == id )

      if ( item ) {
        item.count -= count

        if ( item.count < 0 ) item.count = 0

        ui.inventory.querySelector( `[data-item-id=${id}] .game-inventoryItemCount` ).textContent = item.count
      }
    } break
  }

}
/** Update player inventory
 * @param {HTMLDivElement} [activeDivItem]
 */
function updateInventory( activeDivItem ) {
  const id = activeDivItem.querySelector( `.game-inventoryItemIcon` ).alt
  Game.ui.inventory
    .querySelectorAll( `.game-inventoryItem` )
    .forEach( div => div != activeDivItem && div.classList.remove( `is-active` ) )

  if ( activeDivItem ) activeDivItem.classList.toggle( `is-active` )
  if ( !Game.ui.inventory.querySelector( `.is-active` ) ) Game.chosedItem = null
  else Game.chosedItem = Game.storage.icons.get( id )
}
function createTile( id, x, y, l, rotateAngle ) {
  const { type } = id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups
  const spriteInfo = Sprite.info.get( type )
  const dirs = spriteInfo.connectedDirs
  const { level } = Game
  const { sprites } = Game.storage

  if ( !spriteInfo ) return null
  if ( spriteInfo.connectable ) {
    let dir = `-`

    const left   = level.get( x - 1, y + 0 ).find( tile => tile.type == type )
    const right  = level.get( x + 1, y + 0 ).find( tile => tile.type == type )
    const top    = level.get( x + 0, y - 1 ).find( tile => tile.type == type )
    const bottom = level.get( x + 0, y + 1 ).find( tile => tile.type == type )

    if ( dirs.top || top ) {
      top && top.changeSprite( sprites.get( top.getIdConnectedWith( `bottom` ) ) )
      dir += 1
    }
    else dir += 0

    if ( dirs.right || right ) {
      right && right.changeSprite( sprites.get( right.getIdConnectedWith( `left` ) ) )
      dir += 1
    }
    else dir += 0

    if ( dirs.bottom || bottom ) {
      bottom && bottom.changeSprite( sprites.get( bottom.getIdConnectedWith( `top` ) ) )
      dir += 1
    }
    else dir += 0

    if ( dirs.left || left ) {
      left && left.changeSprite( sprites.get( left.getIdConnectedWith( `right` ) ) )
      dir += 1
    }
    else dir += 0

    id = type + dir
  }

  return new Game.classes[ id == Game.config.playerId ? "Player" : spriteInfo.classname ]( id, {
    tileX: x,
    tileY: y,
    tileL: l,
    sprite: Game.storage.sprites.get( id ),
    rotateAngle: +rotateAngle
  } )
}
/** Place chosed in player inventory item
 * @param {Entity[]} tile
 */
function placeItem( x, y ) {
  const { chosedItem, level, player } = Game

  if ( !chosedItem ) return

  const tile = level.get( x, y )
  const { id } = chosedItem
  const spriteInfo = Sprite.info.get( id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups.type )
  const lastItemOnTile = tile[ tile.length - 1 ].type

  if ( !player.inventory.find( item => item.id == id ).count ) return

  inventory( `remove`, id, 1 )

  if ( spriteInfo.canBePlacedOn.includes( lastItemOnTile ) )
    tile.push( createTile( id, x, y, tile.length, 0 ) )
}

// *
//
//

function createDialog( textContent, iconId ) {
  const { dialogues } = Game.ui
  const { icons } = Game.storage

  const div = document.createElement( `div` )
  const p = document.createElement( `p` )
  const image = iconId && icons.has( iconId ) ? icons.get( iconId ).node.cloneNode() : null
  const words = textContent.split( ` ` )

  p.classList.add( `game-dialogText` )
  div.classList.add( `game-dialog` )
  div.classList.add( `game-box` )

  p.textContent = textContent

  if ( image ) {
    image.classList.add( `game-dialogAvatar` )
    div.appendChild( image )
  }
  div.appendChild( p )

  dialogues.appendChild( div )

  setTimeout( () => div.remove(), 1000 * ( 2 + words.length ) )
}
/**
 * @param {Function} logicFunction
 */
function createAdditionalLogic( logicFunction ) {
  Game.config.userLogic = logicFunction
}
/**
 * @param {Function} drawFunction
 */
function createAdditionalDraw( drawFunction ) {
  Game.userDraw = drawFunction
}
/**
 * @param {Level|Level[]} level_s Instance(s) of Level class
 */
function createLevel( level_s ) {
  if ( !Array.isArray( level_s ) )
    level_s = [ level_s ]

  Game.storage.levels = [ ...Game.storage.levels, ...level_s ]
}
function createEntity( id, src, sprite={} ) {
  const { type } = id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups

  if ( !Sprite.info.has( type ) )  Sprite.info.set( type, new SpriteInfo( type, sprite ) )
  if ( !sprite.src ) sprite.src = src

  Game.storage.icons.set( id, new Icon( id, src ) )
  Game.storage.sprites.set( id, new Sprite( id, sprite ) )
}

// *
//
//

createAdditionalLogic( () => {
  const { player, level, canDoAction, running } = Game
  const { tileSize } = Game.config
  let translateX = 0
  let translateY = 0

  if ( !running || !player ) return

  if ( key( 40 ).triggered ) {
    player.rotateAngle = 90
    player.translateY += player.speed
  }
  if ( key( 39 ).triggered ) {
    player.rotateAngle = 0
    player.translateX += player.speed
  }
  if ( key( 38 ).triggered ) {
    player.rotateAngle = 270
    player.translateY -= player.speed
  }
  if ( key( 37 ).triggered ) {
    player.rotateAngle = 180
    player.translateX -= player.speed
  }
  if ( key( 32 ).triggered && canDoAction ) doAction()

  if ( key( 84 ).triggered ) { // t
    createDialog( `test `.repeat( Math.floor( Math.random() * 15 ) + 1 ), `p` )
    inventory( `add`, `p`, 2 )
  }

  let signX = Math.sign( player.translateX )
  let signY = Math.sign( player.translateY )
  const neighboursX = [
    level.get( player.tileX + signX, player.tileY ) || [],
    level.get( player.tileX + signX, player.tileY + signY ) || []
  ]
  const neighboursY = [
    level.get( player.tileX,         player.tileY + signY ) || [],
    level.get( player.tileX + signX, player.tileY + signY ) || []
  ]

  if ( !player.canStandOn( neighboursY[ 0 ] ) || !player.canStandOn( neighboursY[ 1 ] ) && Math.abs( player.translateX ) > (tileSize - player.size) / 2 + player.speed )
    player.translateY += -signY * player.speed
  else if ( Math.abs( player.translateY ) > tileSize / 2 && player.canStandOn( neighboursY[ 0 ] ) ) {
    level.move( player.tileX, player.tileY, player.tileL, player.tileX, player.tileY + signY )
    player.translateY = -(signY * tileSize - player.translateY)
  }

  if ( !player.canStandOn( neighboursX[ 0 ] ) || !player.canStandOn( neighboursX[ 1 ] ) && Math.abs( player.translateY ) > (tileSize - player.size) / 2 )
    player.translateX += -signX * player.speed
  else if ( Math.abs( player.translateX ) > tileSize / 2 && player.canStandOn( neighboursX[ 0 ] ) ) {
    level.move( player.tileX, player.tileY, player.tileL, player.tileX + signX, player.tileY )
    player.translateX = -(signX * tileSize - player.translateX)
  }
} )
createAdditionalDraw( () => {

} )


window.Game = Game


export {
  setup,
  start,
  stop,
  createAdditionalDraw,
  createEntity,
  createLevel,
  Level,
}