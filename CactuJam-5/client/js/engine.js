import Level from "./engine-level.js"
import { storage as assetsStorage, createEntity, storage } from "./engine-assets.js"
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
    this.moving = true
    this.tileSize = tileSize
    this.playerId = playerId
    this.actionId = actionId
    this.nextFrameTicks = 0
    this.ticksToNextFrame = 5
    this.ctx = this.ui.canvas.getContext( `2d` )
    this.ctx.imageSmoothingEnabled = false
    this.ctxB = this.ui.canvasBgr.getContext( `2d` )
    this.ctxB.imageSmoothingEnabled = false
    this.ctxF = this.ui.canvasFgr.getContext( `2d` )
    this.ctxF.imageSmoothingEnabled = false
    this.storage = { ...assetsStorage,
      userData: {},
      /** @type {KeyInfo[]} */
      keys: [],
      /** @type {Map<String,Level>} */
      levels: new Map
    }
    this.drawingoffsets = { x:0, y:0 }

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
      <canvas class=game-canvas-bgr></canvas>
      <canvas class="game-canvas"></canvas>
      <canvas class=game-canvas-fgr></canvas>
      <article class="game-dialogues"></article>
      <article class="game-inventory"></article>
      <button class="game-box game-canDoAction">Wciśnij spację!</button>
      <article class="game-endScreen">
        <h2 class="game-endScreen-title"></h2>
        <div class="game-endScreen-content"></div>
        <button class="game-endScreen-restart game-box">Restart</button>
      </article>
      <article class="game-clickToPlay">
        Kliknij aby zagrać<br><br><br>
        <small>Nie, nie jest nawet responsywne. Nic ;-;</small>
      </article>
      <article class="game-over">Kliknij aby zakończyć</article>
    `

    this.ui = {
      /** @type {HTMLCanvasElement} */
      canvas: document.body.querySelector( `.game-canvas` ),
      /** @type {HTMLCanvasElement} */
      canvasBgr: document.body.querySelector( `.game-canvas-bgr` ),
      /** @type {HTMLCanvasElement} */
      canvasFgr: document.body.querySelector( `.game-canvas-fgr` ),
      dialogues: document.body.querySelector( `.game-dialogues` ),
      canDoAction: document.body.querySelector( `.game-canDoAction` ),
      inventory: document.body.querySelector( `.game-inventory` ),
      endScreen: document.body.querySelector( `.game-endScreen` ),
      endScreenTitle: document.body.querySelector( `.game-endScreen-title` ),
      endScreenContent: document.body.querySelector( `.game-endScreen-content` ),
      restart: document.body.querySelector( `.game-endScreen-restart` ),
      clickToPlay: document.body.querySelector( `.game-clickToPlay` ),
      over: document.body.querySelector( `.game-over` ),
    }
    this.ui.canvas.width = window.innerWidth
    this.ui.canvas.height = window.innerHeight
    this.ui.canvasBgr.width = window.innerWidth
    this.ui.canvasBgr.height = window.innerHeight
    this.ui.canvasFgr.width = window.innerWidth
    this.ui.canvasFgr.height = window.innerHeight
    this.ui.endScreen.style.display = "none"
    this.ui.over.style.display = "none"
    this.ui.canDoAction.addEventListener( `click`, () => {} )
    this.ui.clickToPlay.addEventListener( `click`, () => {
      this.ui.clickToPlay.style.display = `none`
      this.start( `lab` )
     } )
    this.ui.over.addEventListener( `click`, () => {
      this.ui.over.style.display = "none"
      this.storage.userData.wav_end.play()
      this.ctxF.drawImage( this.storage.userData.fightingEye, 0, 0, this.ctxF.canvas.width, this.ctxF.canvas.height )

      setTimeout( () => {
        this.ctxF.fillRect( 0, 0, this.ctxF.canvas.width, this.ctxF.canvas.height )

        this.end( `ended`, `null`, 0 )
      }, 1000 * 3 )
    } )
  }
  /** Set game events
   * @private
   */
  _setEvents() {
    document.addEventListener( `keydown`, ({ keyCode }) => this.key( keyCode ).pressed = true )
    document.addEventListener( `keyup`, ({ keyCode }) => this.key( keyCode ).pressed = false )
    this.ctx.canvas.addEventListener( `click`, ({ clientX, clientY }) => {
      const { level, tileSize } = this

      if ( !level ) return

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
    const { player, level, canDoAction, running, moving, tileSize, drawingoffsets, storage } = this

    if ( !running || !player ) return

    const speed = level.gravity ? player.fallingSpeed : player.speed
    const gravityFallingSpeed = .08
    const ease = t => {
      let abs = Math.abs( t )

      if ( level.flying ) return Math.sign( t ) * (abs < .5 ?  2 * abs ** 2 : -1 + (4 - 2 * abs) * abs)
      return Math.sign( t ) * (1 + (--abs) * abs * abs * abs * abs)
    }

    if ( !moving ) return

    // Y axis
    if ( (this.key( 40 ).triggered || this.key( 83 ).triggered) && !level.gravity ) {
      // player.rotateAngle = 90

      if ( level.flying ) {
        if ( player.accelerationY < 1 ) player.accelerationY += .02
      }
      else player.translateY += player.speed
    }
    else if ( (this.key( 38 ).triggered || this.key( 87 ).triggered) ) {
      // player.rotateAngle = 270

      if ( level.gravity ) {
        if ( player.grounded ) player.accelerationY = -1

        if ( player.grounded || player.jumping ) {
          player.grounded = false
          player.jumping = true
        }
        if ( (!player.grounded && player.jumping) )
          player.accelerationY += gravityFallingSpeed / 3
        else player.accelerationY += gravityFallingSpeed
      }
      else if ( level.flying ) {
        if ( player.accelerationY > -1 ) player.accelerationY -= .02
      } else player.translateY -= player.speed
    }
    else {
      if ( level.gravity ) {
        player.jumping = false

        if ( !player.grounded && player.accelerationY < 1 ) player.accelerationY += gravityFallingSpeed
      }
      else player.accelerationY -= Math.sign( player.accelerationY ) * .01
    }


    // X axis
    if ( (this.key( 39 ).triggered || this.key( 68 ).triggered) ) {
      // player.rotateAngle = 0
      player.mirrored = false

      if ( level.flying || level.gravity ) {
        if ( player.accelerationX < 1 ) player.accelerationX += .02
      } else player.translateX += player.speed
    }
    else if ( (this.key( 37 ).triggered || this.key( 65 ).triggered) ) {
      // player.rotateAngle = 180
      player.mirrored = true

      if ( level.flying || level.gravity ) {
        if( player.accelerationX > -1 ) player.accelerationX -= .02
      } else player.translateX -= player.speed
    }
    else player.accelerationX -= Math.sign( player.accelerationX ) * .01


    if ( this.key( 32 ).triggered && canDoAction ) this.doAction()

    if ( this.key( 84 ).triggered ) { // t
      createDialog( `test `.repeat( Math.floor( Math.random() * 15 ) + 1 ), this.playerId )
      inventory( `add`, this.playerId, 2 )
    }

    const easeX = ease( player.accelerationX ) * speed
    const easeY = ease( player.accelerationY ) * speed

    player.translateX += easeX
    player.translateY += easeY

    const signX = Math.sign( player.translateX )
    const signY = Math.sign( player.translateY )
    const neighboursX = [
      level.get( player.tileX + signX, player.tileY ) || [],
      level.get( player.tileX + signX, player.tileY + signY ) || []
    ]
    const neighboursY = [
      level.get( player.tileX,         player.tileY + signY ) || [],
      level.get( player.tileX + signX, player.tileY + signY ) || []
    ]

    if ( !this.canStandOn( player, neighboursY[ 0 ] ) && Math.abs( player.translateY ) > speed || !this.canStandOn( player, neighboursY[ 1 ] ) && Math.abs( player.translateX ) > tileSize / 2 ) {//(tileSize - player.size)
      if ( player.accelerationY > 0 ) player.grounded = true

      player.translateY += -signY * speed
      player.accelerationY = 0

      if ( level.flying && storage.killable ) this.end( `flying crash`, level.name, storage.userData[ `${level.name}_run` ] )
    }
    else if ( Math.abs( player.translateY ) > tileSize / 2 && this.canStandOn( player, neighboursY[ 0 ] ) ) {
      const moved = level.move( player.tileX, player.tileY, player.tileL, player.tileX, player.tileY + signY )

      if ( moved ) player.translateY = -(signY * tileSize - player.translateY)
      else {
        player.translateY += -signY * player.speed
        player.accelerationY = 0
      }
    }
    else setTimeout( () => {
      drawingoffsets.y += easeY
    }, level.flying ? 500 : 100 )

    if ( !this.canStandOn( player, neighboursX[ 0 ] ) && Math.abs( player.translateX ) > player.speed || !this.canStandOn( player, neighboursX[ 1 ] ) && Math.abs( player.translateY ) > tileSize / 2 ) {//(tileSize - player.size)
      player.translateX += -signX * player.speed
      player.accelerationX = 0
    }
    else if ( Math.abs( player.translateX ) > tileSize / 2 && this.canStandOn( player, neighboursX[ 0 ] ) ) {
      const moved = level.move( player.tileX, player.tileY, player.tileL, player.tileX + signX, player.tileY )

      if ( moved ) player.translateX = -(signX * tileSize - player.translateX)
      else {
        player.translateX += -signX * player.speed
        player.accelerationX = 0
      }
    }
    else setTimeout( () => {
      drawingoffsets.x += easeX
    }, level.flying ? 500 : 100 )
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
    const { level, running, ticksToNextFrame, nextFrameTicks, player, actionId } = this

    if ( !running || !level ) return
    if ( player ) {
      const playerTile = level.get( player.tileX, player.tileY )
      const { canDoAction } = this.ui

      if ( playerTile && playerTile.some( tile => tile.id == actionId ) ) {
        canDoAction.classList.add( `is-active` )
        this.canDoAction = true
      }
      else {
        canDoAction.classList.remove( `is-active` )
        this.canDoAction = false
      }
    }

    for ( const { entity } of level.everyActionEntity() )
      entity.executeAction()

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
    const { ctx, level, tileSize, drawingoffsets, player } = this

    if ( !level ) return

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    const translateX = window.innerWidth  / 2 - level.width * tileSize  / 2
    const translateY = window.innerHeight / 2 - level.height * tileSize / 2

    ctx.save()
    if ( level.flying || level.gravity) ctx.translate( -drawingoffsets.x, -drawingoffsets.y )

    for ( const { x, y, entity } of level.everyButNotIds( `player` ) )
      entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )

    for ( const { x, y, entity } of level.everyId( `player` ) )
      entity.draw( ctx, translateX + x * tileSize, translateY + y * tileSize, tileSize, tileSize )

    ctx.restore()
  }
  /** Game loop
   * @private
   */
  _loop() {
    if ( !this.running ) return

    this._logic()
    this._playerLogic()
    requestAnimationFrame( () => this._draw() )
  }

  /** Pause in script
   * @param {number} seconds
   */
  async wait( seconds ) {
    return new Promise( res => setTimeout( () => res(), 1000 * seconds ) )
  }
  /** Create dialog box
   * @param {string} textContent
   * @param {string} iconId
   */
  async createDialog( textContent, iconId ) {
    const { dialogues } = this.ui
    const { icons } = this.storage

    const div = document.createElement( `div` )
    const p = document.createElement( `p` )
    const image = iconId && icons.has( iconId ) ? icons.get( iconId ).node.cloneNode() : null
    const words = textContent.split( ` ` )

    p.classList.add( `game-dialogText` )
    div.classList.add( `game-dialog` )
    div.classList.add( `game-box` )

    p.innerHTML = textContent

    if ( image ) {
      image.classList.add( `game-dialogAvatar` )
      div.appendChild( image )
    }
    div.appendChild( p )

    dialogues.appendChild( div )

    this.storage.userData.wav_newMsg.play()

    setTimeout( () => {
      this.storage.userData.wav_newMsg.pause();
      this.storage.userData.wav_newMsg.currentTime = 0;
    }, 100 )

    return new Promise( res => setTimeout( () => {
      div.remove()
      res()
    }, 1000 * ( 2 + words.length / 2 ) ) )

  }

  /** Create levels
   * @param {Map<String,{ tiles:string[][]|string[][][] script:function():Promise events:function():void }>} levels
   * */
  createLevels( levels ) {
    for ( const [ levelname, levelInitializator ] of levels )
      this.storage.levels.set( levelname, new Level( levelname, { ...levelInitializator, buildingSpeed:this.levelsBuildingSpeed } ) )
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
   * @param {Entity|String} entity
   * @param {Entity[]} tile
   */
  canStandOn( entity, tile ) {
    const { canBePlacedOn } = typeof entity == `string` ? storage.spritesInfo.get( entity ) : entity.sprite.info

    if ( (this.level.flying || this.level.gravity) && (!tile.length || tile[ 0 ] == this.player) ) return true
    if ( !tile.length ) return canBePlacedOn.includes( null )
    return canBePlacedOn.includes( tile[ tile.length - 1 ].group )
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
   * @param {"add"|"set"|"remove"|"get"} action
   * @param {string} id
   * @param {number} count
   * @param {boolean} hide
   */
  inventory( action, itemGroup, count=1, hide=false ) {
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
        const existingDiv = ui.inventory.querySelector( `[data-item-group=${itemGroup}]` )

        if ( existingDiv ) {
          existingDiv.querySelector( `.game-inventoryItemCount` ).textContent = count
          existingDiv.style.display = hide ? `none` : `block`
          break
        }

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
        div.style.display = hide ? `none` : `block`

        ui.inventory.appendChild( div )
      } break
      case `remove`: {
        const item = player.inventory.find( item => item.group == itemGroup )

        if ( item ) {
          item.count -= count

          if ( item.count < 0 ) item.count = 0

          const div = ui.inventory.querySelector( `[data-item-group=${itemGroup}]` )
          div.querySelector( `.game-inventoryItemCount` ).textContent = item.count
          div.style.display = hide ? `none` : `block`
        }
      } break
      case "get": {
        return player.inventory.find( item => item.group == itemGroup )
      } break
    }
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
  end( reason, levelName, stage ) {
    const { ctx, ctxB, ctxF, ui, storage } = this

    this.running = false

    let title
    let content

    if ( reason == `killed` ) {
      if ( levelName == `fight` ) switch ( stage ) {
        case 1:
          title = `Pokonany przez potwora`
          content = `Zostałeś pokonany na najprostszym poziomie, na którym toczyła sie walka. Wstyd!`
      }
      else if ( levelName == `flying1` || levelName == `flying2` || levelName == `flying3` ) switch ( stage ) {
        case 1:
          title = `Zjedzony przez ptaka`
          content = `Jak to jest próbować zjeść lotnika w locie? Dobrze?`
      }
    }
    else if ( reason == `flying crash` ) {
      content = `Mogliby wymyślić helikoptery które lataja wyżej.`
      title = `Rozbity`
    }
    else if ( reason == `freezed` ) {
      if ( levelName == `flying3` ) switch ( stage ) {
        case 1:
          title = `Zamrożony`
          content = `Ziiiimnoooo, Szybko restart!`
      }
    }
    else if ( reason == `over` ) {
      ui.over.style.display = `block`
      return
    }
    else if ( reason == `ended` ) {
      title = `Wygrana!`
      content = `Koniec gry!<br> Dzięki zmęczeniu nie rozpiszę się, ale wiele treści możnaby tu dodać, i poprawić...`
      ui.restart.style.display = `none`
    }

    clearInterval( storage.userData.interval )

    ui.endScreen.style.display = `block`
    ui.endScreenTitle.innerHTML = title
    ui.endScreenContent.innerHTML = content
    ui.restart.onclick = () => {
      ui.endScreen.style.display = `none`
      storage.userData[ `${levelName}_run` ] = stage
      this.buildLevel( levelName )
    }

    // ctxB.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.width )
    // ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.width )
    // ctxF.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.width )
  }
  /** Build level on the screen
   * @param {string} levelName
   * @param {function():void} callback
   */
  buildLevel( levelName, restart=true, callback=()=>{} ) {
    this.running = false

    const level = this.storage.levels.get( levelName )
    const data = this.storage.userData

    if ( data.wav_lab ) {
      data.wav_lab.pause();
      data.wav_lab.currentTime = 0;
    }
    if ( data.wav_map ) {
      data.wav_map.pause();
      data.wav_map.currentTime = 0;
    }
    if ( data.wav_fightAndFlying ) {
      data.wav_fightAndFlying.pause();
      data.wav_fightAndFlying.currentTime = 0;
    }




    if ( !level ) return

    this.level = level
    this.level.runCounter++
    this.level.build().then( () => {
      this.running = true

      const sterables = Array.from( level.everySterable() )

      // if ( playerTile ) {
      if ( sterables.length > 0 ) {
        const { x, y, l } = sterables[ 0 ]

        this.player = level.tiles[ y ][ x ][ l ]

        this.drawingoffsets.x = (x - level.tiles[ y ].length / 2) * this.tileSize
        this.drawingoffsets.y = (y - level.tiles.length / 2) * this.tileSize
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