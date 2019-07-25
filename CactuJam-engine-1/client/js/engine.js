import * as GameClassesStorage from "./engine-classes.js"

const { Entity, Player, Icon, SpriteInfo, Sprite } = GameClassesStorage

export class KeyInfo {
  constructor( code, interval=0 ) {
    this.code = code
    this.active = true
    this.pressed = false
    this.interval = interval
  }

  get triggered() {
    if ( !this.pressed || !this.active ) return false

    this.active = false
    setTimeout( () => this.active = true, this.interval * 1000 )

    return true
  }
}

export class Level {
  /**
   * @param {_Game} game
   * @param {Object} param1
   * @param {Entity[][][]} param1.tiles
   * @param {Function} param1.script
   * @param {Function} param1.events
   */
  constructor( game, { tiles, script, events } ) {
    this.game = game
    this.height = tiles.length
    this.width = 0
    /** @type {Entity[][][]} */
    this.tiles = tiles
    this.script = script
    this.events = events
    this.length = tiles.length
    this.runCounter = 0

    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        if ( !Array.isArray( tiles[ y ][ x ] ) ) tiles[ y ][ x ] = [ tiles[ y ][ x ] ]
        if ( x > this.width ) this.width = x

        for ( let l = 0;  l < tiles[ y ][ x ].length;  l++ ) {
          const entityData = tiles[ y ][ x ][ l ]

          if ( !entityData ) continue

          const { spriteId, rotateAngle } = entityData.match( /(?<spriteId>[^-]+)(?:-(?<rotateAngle>[^-]+))?/ ).groups
          const tile = this.createTile( spriteId, x, y, l, rotateAngle )

          if ( !tile ) continue

          this.tiles[ y ][ x ][ l ] = tile
        }
      }
  }

  async build() {
    const { tiles } = this
    const indices = []

    for ( const { x, y, l, entity } of this.everyEntity() )
      if ( typeof entity != `string` ) indices.push( { x, y } )

    this.tiles = Array.from( { length:tiles.length }, (_, i) => Array.from( { length:tiles[ i ].length }, () => [] ) )

    const timePerTile = Level.buildingSpeed / indices.length
    const builderHelper = () => new Promise( resolve => {
      if ( !indices.length ) resolve()

      const index = Math.floor( Math.random() * indices.length )
      const { x, y } = indices[ index ]

      this.tiles[ y ][ x ] = tiles[ y ][ x ].filter( entity => typeof entity != "string" )

      indices.splice( index, 1 )

      setTimeout( () => builderHelper().then( () => resolve() ), timePerTile * 1000 )
    } )

    await builderHelper()
  }

  * everyEntityInLayerHigherThan( layer ) {
    for ( const data of this.every( layer + 1, Infinity ) )
      yield data
  }
  * everyEntityInLayer( layer ) {
    for ( const data of this.every( layer, layer + 1 ) )
      yield data
  }
  * everyButNotIds( ...ids ) {
    for ( const data of this.every( 0, Infinity ) )
      if ( !ids.includes( data.entity.id ) ) yield data
  }
  * everyId( ...ids ) {
    for ( const data of this.every( 0, Infinity ) )
      if ( ids.includes( data.entity.id ) ) yield data
  }
  * everyEntity() {
    for ( const data of this.every( 0, Infinity ) )
      yield data
  }
  * every( layerMin, layerMax ) {
    const { tiles } = this

    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        const stop = layerMax == Infinity  ?  tiles[ y ][ x ].length  :  layerMax

        for ( let l = layerMin;  l < stop;  l++ )
          if ( tiles[ y ][ x ][ l ] ) yield { x, y, l, entity:tiles[ y ][ x ][ l ] }
      }
  }

  row( y ) {
    const { tiles } = this

    if ( y < 0 || tiles.length <= y ) return null
    return tiles[ y ]
  }
  get( x, y ) {
    const { tiles } = this

    if ( y < 0 || tiles.length <= y ) return null
    if ( x < 0 || tiles[ 0 ].length <= x ) return null
    return tiles[ y ][ x ]
  }
  getTop( x, y ) {
    const tile = this.get( x, y )

    return !tile ? null : tile[ tile.length - 1 ]
  }
  move( x, y, l, newX, newY ) {
    const newTile = this.get( newX, newY )
    const entities = this.get( x, y ).splice( l )

    entities.forEach( (entity, i) => {
      entity.tileX = newX
      entity.tileY = newY
      entity.tileL = newTile.length + i
    } )

    this.tiles[ newY ][ newX ].push( ...entities )
  }
  remove( x, y, l ) {
    this.get( x, y ).splice( l )
  }
  createTile( id, x, y, l, rotateAngle ) {
    const { type } = id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups
    const { sprites, spritesInfos } = this.game.storage
    const spriteInfo = spritesInfos.get( type )

    if ( !spriteInfo ) return null

    const dirs = spriteInfo.connectedDirs

    if ( spriteInfo.connectable ) {
      let dir = `-`

      const left   = this.get( x - 1, y + 0 ).find( tile => tile.type == type )
      const right  = this.get( x + 1, y + 0 ).find( tile => tile.type == type )
      const top    = this.get( x + 0, y - 1 ).find( tile => tile.type == type )
      const bottom = this.get( x + 0, y + 1 ).find( tile => tile.type == type )

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

    return new GameClassesStorage[ spriteInfo.classname ]( id, {
      tileX: x,
      tileY: y,
      tileL: l,
      sprite: sprites.get( id ),
      rotateAngle: +rotateAngle
    } )
  }
}

export class InventoryItem {
  constructor( id, count=0 ) {
    this.id = id
    this.count = count
  }
}

export default class _Game {
  constructor( tag, { tileSize=50, playerSpeed=1, levelsBuildingSpeed=5 } ) {
    this.tag = tag

    this._buildUi()

    this.player = null
    this.running = false
    this.tileSize = tileSize
    this.nextFrameTicks = 0
    this.ticksToNextFrame = 5
    this.ctx = this.ui.canvas.getContext( `2d` )
    this.ctx.imageSmoothingEnabled = false
    this.storage = {
      /** @type {Map<String,Level>} */
      levels: new Map,
      /** @type {Map<String,Icon>} */
      icons: new Map,
      /** @type {Map<String,Sprite>} */
      sprites: new Map,
      /** @type {Map<String,SpriteInfo>} */
      spritesInfos: new Map,
      /** @type {KeyInfo[]} */
      keys: []
    }

    /** @type {Level} */
    this.level = null
    /** @type {Number} */
    this.loopIntervalId = null

    this._setEvents()
  }

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
  _setEvents() {
    this.tag.addEventListener( `keydown`, ({ keyCode }) => this.key( keyCode ).pressed = true )
    this.tag.addEventListener( `keyup`, ({ keyCode }) => this.key( keyCode ).pressed = false )
    this.ctx.canvas.addEventListener( `click`, ({ clientX, clientY }) => {
      const { level, tileSize } = this

      const x = Math.floor( (clientX - (window.innerWidth - level.width * tileSize) / 2) / tileSize )
      const y = Math.floor( (clientY - (window.innerHeight - level.height * tileSize) / 2) / tileSize )
      const tileTop = level.getTop( x, y )

      if ( tileTop == null ) return

      // tileTop.onclick( level, this.storage.sprites, createTile, inventory )

      console.log( level.get( x, y ) )

      this._placeItem( x, y )
    } )
  }
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
  _placeItem( x, y ) {
    const { chosedItem, level, player } = this

    if ( !chosedItem ) return

    const tile = level.get( x, y )
    const { id } = chosedItem
    const spriteInfo = this.storage.spritesInfos.get( id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups.type )
    const lastItemOnTile = tile[ tile.length - 1 ].type

    if ( !player.inventory.find( item => item.id == id ).count ) return

    this.inventory( `remove`, id, 1 )

    if ( spriteInfo.canBePlacedOn.includes( lastItemOnTile ) )
      tile.push( level.createTile( id, x, y, tile.length, 0 ) )
  }
  _logic() {
    const { level, running, ticksToNextFrame, nextFrameTicks, player } = this

    if ( !running || !level ) return
    if ( player ) {
      const playerTile = level.get( player.tileX, player.tileY )
      const { canDoAction } = this.ui

      if ( playerTile.some( tile => tile.id == `e` ) ) {
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
  _draw() {
    const { ctx, level, tileSize } = this

    if ( !level ) return

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    const translateX = window.innerWidth / 2 - level.width * tileSize / 2
    const translateY = window.innerHeight / 2 - level.height * tileSize / 2

    for ( const { x, y, entity } of level.everyButNotIds( `p` ) )
      entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )

    for ( const { x, y, entity } of level.everyId( `p` ) )
      entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )
  }
  _loop() {
    this._logic()
    this._playerLogic()
    requestAnimationFrame( () => this._draw() )
  }

  /** @param {Map<String,{ tiles:Any script:Function events:Function }>} levels */
  createLevels( levels ) {
    for ( const [ levelname, levelInitializator ] of levels )
      this.storage.levels.set( levelname, new Level( this, levelInitializator ) )
  }
  createEntity( id, src, sprite={} ) {
    const { type } = id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups
    const { spritesInfos, sprites, icons } = this.storage

    if ( !spritesInfos.has( type ) )  spritesInfos.set( type, new SpriteInfo( type, sprite ) )
    if ( !sprite.src ) sprite.src = src

    icons.set( id, new Icon( id, src ) )
    sprites.set( id, new Sprite( id, sprite ) )
  }
  canStandOn( entity, tile ) {
    const { canBePlacedOn } = this.storage.spritesInfos.get( entity.type )

    if ( !tile.length ) return canBePlacedOn.includes( null )
    else return canBePlacedOn.includes( tile[ tile.length - 1 ].id )
  }
  updateInventory( activeDivItem ) {
    const id = activeDivItem.querySelector( `.game-inventoryItemIcon` ).alt
    this.ui.inventory
      .querySelectorAll( `.game-inventoryItem` )
      .forEach( div => div != activeDivItem && div.classList.remove( `is-active` ) )

    if ( activeDivItem ) activeDivItem.classList.toggle( `is-active` )
    if ( !this.ui.inventory.querySelector( `.is-active` ) ) this.chosedItem = null
    else this.chosedItem = this.storage.icons.get( id )
  }
  inventory( action, id, count, hide=false ) {
    const { player, ui } = this
    const { icons } = this.storage

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

        div.addEventListener( `click`, () => this.updateInventory( div ) )

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
  doAction() {
    const { canDoAction, player, level } = this
    const { tileX, tileY } = player
    const playerTile = level.get( tileX, tileY )

    if ( !canDoAction || !playerTile || !playerTile.some( tile => tile.id == `e` ) ) return

    let eventInOrder = 0

    for ( const { x, y, entity } of level.everyId( `e` ) )
      if ( x != tileX || y != tileY ) eventInOrder++
      else break

    level.events( eventInOrder, this )
  }
  start( levelName=`` ) {
    if ( levelName ) this.buildLevel( levelName )

    this.loopIntervalId = setInterval( () => this._loop(), 1000 / 60 )
  }
  stop() {
    clearInterval( this.loopIntervalId )
  }
  buildLevel( levelName, callback=()=>{} ) {
    this.running = false

    const level = this.storage.levels.get( levelName )

    if ( !level ) return

    this.level = level
    this.level.runCounter++
    this.level.build().then( () => {
      this.running = true

      for ( const { x, y, l,  entity } of level.everyId( `p` ) ) {
        this.player = level.tiles[ y ][ x ][ l ] =  new Player( `p`, entity )
        break
      }
      this.level.script( game )
      callback()
    } )
  }
  key( key ) {
    const { keys } = this.storage

    if ( !keys[ key ] ) keys[ key ] = new KeyInfo( key )

    return keys[ key ]
  }
}