import Level from "./engine-level.js"
import { storage as assetsStorage, createEntity } from "./engine-assets.js"
import { Entity, Player, InventoryItem } from "./engine-entities.js"

class KeyInfo {
  /**
   * @param {number} code Key code
   * @param {number} interval Pause between next triggering in seconds
   */
  constructor( code, interval=0 ) {
    this.code = code
    this.active = true
    this.pressed = false
    this.interval = interval
  }

  /** Get pressed state, and set interval when its true
   */
  get triggered() {
    if ( !this.pressed || !this.active ) return false

    this.active = false
    setTimeout( () => this.active = true, this.interval * 1000 )

    return true
  }
}

export default class Game {
  /**
   * @param {HTMLDivElement} tag
   * @param {object} param1
   * @param {number} param1.tileSize
   * @param {number} param1.tileSize
   * @param {string} param1.tileSize
   * @param {string} param1.tileSize
   */
  constructor( tag, { playerId, actionId, tileSize=50, levelsBuildingSpeed=5 } ) {
    this.tag = tag

    this._buildUi()

    /** @type {Player} */
    this.player = null
    this.running = false
    this.tileSize = tileSize
    this.playerId = playerId
    this.actionId = actionId
    this.nextFrameTicks = 0
    this.ticksToNextFrame = 5
    this.ctx = this.ui.canvas.getContext( `2d` )
    this.ctx.imageSmoothingEnabled = false
    this.storage = { ...assetsStorage,
      /** @type {KeyInfo[]} */
      keys: [],
      /** @type {Map<String,Level>} */
      levels: new Map
    }

    this.levelsBuildingSpeed = levelsBuildingSpeed
    /** @type {Level} */
    this.level = null
    /** @type {number} */
    this.loopIntervalId = null

    this._setEvents()
  }

  /** Build user interface
   * @private
   */
  _buildUi() {
    this.tag.innerHTML = /* html */ `
      <canvas class="game-canvas"></canvas>
      <article class="game-dialogues"></article>
      <article class="game-inventory"></article>
      <button class="game-box game-canDoAction">Wciśnij spację!</button>
    `

    this.ui = {
      canvas: document.body.querySelector( `.game-canvas` ),
      dialogues: document.body.querySelector( `.game-dialogues` ),
      canDoAction: document.body.querySelector( `.game-canDoAction` ),
      inventory: document.body.querySelector( `.game-inventory` ),
    }
    this.ui.canvas.width = window.innerWidth,
    this.ui.canvas.height = window.innerHeight,
    this.ui.canDoAction.addEventListener( `click`, () => doAction() )
  }
  /** Set game events
   * @private
   */
  _setEvents() {
    this.tag.addEventListener( `keydown`, ({ keyCode }) => this.key( keyCode ).pressed = true )
    this.tag.addEventListener( `keyup`, ({ keyCode }) => this.key( keyCode ).pressed = false )
    this.ctx.canvas.addEventListener( `click`, ({ clientX, clientY }) => {
      const { level, tileSize } = this

      const x = Math.floor( (clientX - (window.innerWidth - level.width * tileSize) / 2) / tileSize )
      const y = Math.floor( (clientY - (window.innerHeight - level.height * tileSize) / 2) / tileSize )
      const tileTop = level.getTop( x, y )

      if ( tileTop == null ) return

      tileTop.onclick( this )

      this._placeItem( x, y )
    } )
  }
  /** Player logic
   * @private
   */
  _playerLogic() {
    const { player, level, canDoAction, running, tileSize } = this

    if ( !running || !player ) return

    if ( this.key( 40 ).triggered ) {
      player.rotateAngle = 90
      player.translateY += player.speed
    }
    if ( this.key( 39 ).triggered ) {
      player.rotateAngle = 0
      player.translateX += player.speed
    }
    if ( this.key( 38 ).triggered ) {
      player.rotateAngle = 270
      player.translateY -= player.speed
    }
    if ( this.key( 37 ).triggered ) {
      player.rotateAngle = 180
      player.translateX -= player.speed
    }
    if ( this.key( 32 ).triggered && canDoAction ) this.doAction()

    if ( this.key( 84 ).triggered ) { // t
      createDialog( `test `.repeat( Math.floor( Math.random() * 15 ) + 1 ), this.playerId )
      inventory( `add`, this.playerId, 2 )
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

    if ( !this.canStandOn( player, neighboursY[ 0 ] ) || !this.canStandOn( player, neighboursY[ 1 ] ) && Math.abs( player.translateX ) > (tileSize - player.size) / 2 + player.speed )
      player.translateY += -signY * player.speed
    else if ( Math.abs( player.translateY ) > tileSize / 2 && this.canStandOn( player, neighboursY[ 0 ] ) ) {
      level.move( player.tileX, player.tileY, player.tileL, player.tileX, player.tileY + signY )
      player.translateY = -(signY * tileSize - player.translateY)
    }

    if ( !this.canStandOn( player, neighboursX[ 0 ] ) || !this.canStandOn( player, neighboursX[ 1 ] ) && Math.abs( player.translateY ) > (tileSize - player.size) / 2 )
      player.translateX += -signX * player.speed
    else if ( Math.abs( player.translateX ) > tileSize / 2 && this.canStandOn( player, neighboursX[ 0 ] ) ) {
      level.move( player.tileX, player.tileY, player.tileL, player.tileX + signX, player.tileY )
      player.translateX = -(signX * tileSize - player.translateX)
    }
  }
  /** Place item on level
   * @param {number} x
   * @param {number} y
   * @private
   */
  _placeItem( x, y ) {
    const { chosedItem, level, player } = this

    if ( !chosedItem ) return

    const tile = level.get( x, y )
    const { linkedSpriteGroup } = chosedItem
    const spriteInfo = assetsStorage.spritesInfo.get( linkedSpriteGroup )
    const lastItemOnTile = tile[ tile.length - 1 ].group

    if ( player.inventory.find( item => item.group == linkedSpriteGroup ).count && spriteInfo.canBePlacedOn.includes( lastItemOnTile ) ) {
      this.inventory( `remove`, linkedSpriteGroup, 1 )
      tile.push( level.createTile( linkedSpriteGroup, x, y, tile.length, 0 ) )
    }
  }
  /** Game logic
   * @private
   */
  _logic() {
    const { level, running, ticksToNextFrame, nextFrameTicks, player } = this

    if ( !running || !level ) return
    if ( player ) {
      const playerTile = level.get( player.tileX, player.tileY )
      const { canDoAction } = this.ui

      if ( playerTile.some( tile => tile.id == `empty` ) ) {
        canDoAction.classList.add( `is-active` )
        this.canDoAction = true
      }
      else {
        canDoAction.classList.remove( `is-active` )
        this.canDoAction = false
      }
    }
    if ( ticksToNextFrame == nextFrameTicks ) {
      this.nextFrameTicks = 0

      for ( const { entity } of level.everyEntity() )
        entity.nextFrame()
    }
    else this.nextFrameTicks++
  }
  /** Game drawing
   * @private
   */
  _draw() {
    const { ctx, level, tileSize } = this

    if ( !level ) return

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    const translateX = window.innerWidth / 2 - level.width * tileSize / 2
    const translateY = window.innerHeight / 2 - level.height * tileSize / 2

    for ( const { x, y, entity } of level.everyButNotIds( `player` ) )
      entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )

    for ( const { x, y, entity } of level.everyId( `player` ) )
      entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )
  }
  /** Game loop
   * @private
   */
  _loop() {
    this._logic()
    this._playerLogic()
    requestAnimationFrame( () => this._draw() )
  }

  /** Create levels
   * @param {Map<String,{ tiles:string[][]|string[][][] script:function():Promise events:function():void }>} levels
   * */
  createLevels( levels ) {
    for ( const [ levelname, levelInitializator ] of levels )
      this.storage.levels.set( levelname, new Level( { ...levelInitializator, buildingSpeed:this.levelsBuildingSpeed } ) )
  }
  /** Object needed to initialize sprite asset
   * @param {string} src
   * @param {object} sprite
   * @param {string[]} sprite.canBePlacedOn
   * @param {boolean} sprite.connectable
   * @param {object} sprite.connectedDirs
   * @param {boolean} sprite.connectedDirs.left
   * @param {boolean} sprite.connectedDirs.right
   * @param {boolean} sprite.connectedDirs.top
   * @param {boolean} sprite.connectedDirs.bottom
   * @param {string} sprite.classname
   * @param {number} sprite.framesInRow
   * @param {number} sprite.frames
   */
  createEntity( src, sprite={} ) {
    createEntity( src, sprite )
  }
  /** Check do entity can be placed on top of tile
   * @param {Entity} entity
   * @param {Entity[]} tile
   */
  canStandOn( entity, tile ) {
    const { canBePlacedOn } = entity.sprite.info

    // console.log( canBePlacedOn, tile[ tile.length - 1 ] )

    if ( !tile.length ) return canBePlacedOn.includes( null )
    else return canBePlacedOn.includes( tile[ tile.length - 1 ].id )
  }
  /** Update the inventory
   * @param {HTMLDivElement} activeDivItem
   */
  updateInventory( activeDivItem ) {
    const group = activeDivItem.querySelector( `.game-inventoryItemIcon` ).alt
    this.ui.inventory
      .querySelectorAll( `.game-inventoryItem` )
      .forEach( div => div != activeDivItem && div.classList.remove( `is-active` ) )

    if ( activeDivItem ) activeDivItem.classList.toggle( `is-active` )
    if ( !this.ui.inventory.querySelector( `.is-active` ) ) this.chosedItem = null
    else this.chosedItem = assetsStorage.icons.get( group )
  }
  /** Manipulate inventory items
   * @param {"add"|"set"|"remove"} action
   * @param {string} id
   * @param {number} count
   * @param {boolean} hide
   */
  inventory( action, itemGroup, count, hide=false ) {
    const { player, ui } = this
    const { icons } = assetsStorage

    switch ( action ) {
      case `add`: {
        const item = player.inventory.find( item => item.group == itemGroup )

        if ( item ) {
          item.count += count
          ui.inventory.querySelector( `[data-item-group=${itemGroup}] .game-inventoryItemCount` ).textContent = item.count
          break
        }
      }
      case `set`: {
        player.inventory.push( new InventoryItem( itemGroup, count ) )

        const div = document.createElement( `div` )
        const p = document.createElement( `p` )
        const image = itemGroup && icons.has( itemGroup ) ? icons.get( itemGroup ).node.cloneNode() : null

        p.textContent = count
        image.alt = itemGroup

        image.classList.add( `game-inventoryItemIcon` )
        p.classList.add( `game-inventoryItemCount` )
        div.classList.add( `game-inventoryItem` )
        div.classList.add( `game-box` )
        div.dataset.itemGroup = itemGroup

        div.appendChild( p )
        div.appendChild( image )

        div.addEventListener( `click`, () => this.updateInventory( div ) )

        ui.inventory.appendChild( div )
      } break
      case `remove`: {
        const item = player.inventory.find( item => item.group == itemGroup )

        if ( item ) {
          item.count -= count

          if ( item.count < 0 ) item.count = 0

          ui.inventory.querySelector( `[data-item-group=${itemGroup}] .game-inventoryItemCount` ).textContent = item.count
        }
      } break
    }
  }
  /** Create dialog box
   * @param {string} textContent
   * @param {string} iconId
   */
  createDialog( textContent, iconId ) {
    const { dialogues } = this.ui
    const { icons } = this.storage

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
  /** Do action, when player is staying on event tile
   */
  doAction() {
    const { canDoAction, player, level } = this
    const { tileX, tileY } = player
    const playerTile = level.get( tileX, tileY )

    if ( !canDoAction || !playerTile || !playerTile.some( tile => tile.id == this.actionId ) ) return

    let eventInOrder = 0

    for ( const { x, y, entity } of level.everyId( this.actionId ) )
      if ( x != tileX || y != tileY ) eventInOrder++
      else break

    level.events( eventInOrder, this )
  }
  /** Run the game and optionaly build the level
   */
  start( levelName=`` ) {
    if ( levelName ) this.buildLevel( levelName )

    this.loopIntervalId = setInterval( () => this._loop(), 1000 / 60 )
  }
  /** Stop the game
   */
  stop() {
    clearInterval( this.loopIntervalId )
  }
  /** Build level on the screen
   * @param {string} levelName
   * @param {function():void} callback
   */
  buildLevel( levelName, callback=()=>{} ) {
    this.running = false

    const level = this.storage.levels.get( levelName )

    if ( !level ) return

    this.level = level
    this.level.runCounter++
    this.level.build().then( () => {
      this.running = true

      for ( const { x, y, l,  entity } of level.everyId( this.playerId ) ) {
        this.player = level.tiles[ y ][ x ][ l ]
        break
      }
      this.level.script( game )
      callback()
    } )
  }
  /** Get key information
   * @param {number} keycode
   */
  key( keycode ) {
    const { keys } = this.storage

    if ( !keys[ keycode ] ) {
      let interval

      if ( keycode == 32 ) interval = .5
      else interval = 0

      keys[ keycode ] = new KeyInfo( keycode, interval )
    }

    return keys[ keycode ]
  }
}