
class GridCell {
  constructor( x, y ) {
    this.x = x
    this.y = y

    /** @type {Texture} */
    this.floor = null

    /** @type {Texture} */
    this.spawner = null

    /** @type {Texture} */
    this.entity = null

    /** @type {Texture} */
    this.cloth = null

    this.clothData = { x:null, y:null, clear:false }

    this.washing = {
      item: null,
      angle: 0,
      time: 0,
    }
  }
}

class Grid {
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x
   * @param {Number} y
   * @param {Number} cellSize
   */
  constructor( ctx, cellSize, x=null, y=null, centered=true ) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.size = cellSize
    this.centered = centered

    this.startPos = {
      x: 0,
      y: 0
    }

    if ( x != null && y != null )
      this.build( x, y )
  }

  build( x, y ) {
    const c = this.ctx.canvas

    this.data =
      [ ...Array( y ) ].map( (v, cellY) =>
      [ ...Array( x ) ].map( (emptyCell, cellX) => new GridCell( cellX, cellY ) )
    )

    this.x = x
    this.y = y

    this.startPos = {
      x: c.width / 2 - x * this.size / 2,
      y: c.height / 2 - y * this.size / 2
    }
  }

  resize() {
    const c = this.ctx.canvas

    this.startPos = {
      x: c.width / 2 - this.x * this.size / 2,
      y: c.height / 2 - this.y * this.size / 2
    }
  }

  get( x, y ) {
    return (this.data[ y ] || [])[ x ]
  }

  cellX( x ) {
    return this.startPos.x + this.size * x
  }

  cellY( y ) {
    return this.startPos.y + this.size * y
  }

  changeCell( layerName, cell, newX, newY ) { return
    const newCell = this.get( newX, newY )

    newCell[ layerName ] = cell[ layerName ]

    if ( layerName == `cloth` )
      newCell.clothData = cell.clothData

    this.clearCell( cell.x, cell.y )
  }

  * cellsIterator() {
    if ( !this.data )
      return

    for ( const row of this.data )
      for ( const cell of row )
        yield cell
  }
}

class Texture {
  constructor( src, frameWidth, frameHeight, framesInRow=1, framesInColumn=1, countOfFrames=framesInRow*framesInColumn ) {
    this.tex = new Image
    this.tex.src = src

    this.name = src.split( /.*\// )[ 1 ].split( `.png` )[ 0 ]

    this.width = frameWidth
    this.height = frameHeight
    this.rows = framesInColumn
    this.columns = framesInRow
    this.countOfFrames = countOfFrames

    this.interval = null
    this._frame = 1
    this._x = 0
    this._y = 0
  }

  nextFrame() {
    if ( this.tex.height % this.size == 1 && this.tex.width % this.size == 1 )
      return

    if ( this._frame != this.countOfFrames && this._x + 1 != this.columns )
      this._x++
    else if ( this._y + 1 != this.rows ) {
      this._x = 0
      this._y++
    }
    else {
      this._frame = 0
      this._x = 0
      this._y = 0
    }

    this._frame++
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x
   * @param {Number} y
   */
  draw( ctx, x=0, y=0, widthSize, heightSize=widthSize ) {
    const { tex, width, height, _x, _y } = this

    ctx.drawImage( tex,
      tex.width / this.columns * _x , tex.height / this.rows * _y, width, height,
      x, y, widthSize, heightSize
    )
  }

  get x() {
    return this.size * this._x
  }

  get y() {
    return this.size * this._y
  }
}

class Game {
  constructor() {
    /** @type {Map<String,Texture>} */
    this.graphics = new Map( [
      [ "floor", new Texture( `./img/floor.png`, 22, 22 ) ],
      [ "spawn", new Texture( `./img/spawn.png`, 22, 22 ) ],
      [ "despawn", new Texture( `./img/despawn.png`, 22, 22 ) ],

      [ `barrel`, new Texture( `./img/barrel.png`, 22, 29, 4, 4, 14 ) ],
      [ `washmachine`, new Texture( `./img/washmachine.png`, 22, 29, 4, 4, 14 ) ],

      [ "dirt", new Texture( `./img/dirt.png`, 8, 4 ) ],
      [ "cloth", new Texture( `./img/cloth.png`, 8, 4 ) ],

      [ "conveyor-t.l", new Texture( `./img/conveyor-t.l.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-t.r", new Texture( `./img/conveyor-t.r.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-t.b", new Texture( `./img/conveyor-t.b.png`, 22, 22, 3, 4, 11 ) ],

      [ "conveyor-b.l", new Texture( `./img/conveyor-b.l.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-b.r", new Texture( `./img/conveyor-b.r.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-b.t", new Texture( `./img/conveyor-b.t.png`, 22, 22, 3, 4, 11 ) ],

      [ "conveyor-l.r", new Texture( `./img/conveyor-l.r.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-l.t", new Texture( `./img/conveyor-l.t.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-l.b", new Texture( `./img/conveyor-l.b.png`, 22, 22, 3, 4, 11 ) ],

      [ "conveyor-r.l", new Texture( `./img/conveyor-r.l.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-r.t", new Texture( `./img/conveyor-r.t.png`, 22, 22, 3, 4, 11 ) ],
      [ "conveyor-r.b", new Texture( `./img/conveyor-r.b.png`, 22, 22, 3, 4, 11 ) ],
    ] )

    this.ui = {
      initScreen: document.querySelector( `.game-init` ),
      canvas: document.querySelector( `canvas` ),
      items: document.querySelector( `.game-items` ),
      messages: document.querySelector( `.game-messages` ),
      data: document.querySelector( `.game-data` ),
      inventory: document.querySelector( `.game-inventory` ),
      direction: document.querySelector( `.game-direction` ),
    }
    this.playerData = {
      inventory: null,
      barrels: 0,
      washmachines: 0,
      conveyors: 0
    }
    this.camera = {
      mouse: { x:null, y:null },
      clickedCell: null
    }
    this.nonclickableLevels = [ 6, 7, 8, 9, 10 ]
    this.directions = {
      "←": `l`,
      "↑": `t`,
      "→": `r`,
      "↓": `b`,
      opposite: {
        "l": `r`,
        "t": `b`,
        "r": `l`,
        "b": `t`,
      }
    }

    this.level = { clothesToClear:0, map:[], num:0 }
    this.doneClothes = 0
    this.doneClothesArr = []

    this.ui.initScreen.remove()
    this.ctx = this.ui.canvas.getContext( `2d` )

    Dialogs.init( this.ui.messages, `game-message`, `./wav/new_message.wav` )
    this.map = new Grid( this.ctx, 50 ) // this.graphics.get( `floor` )

    this.resize()
    this.eventsAndTimers()

    const uItems = document.querySelectorAll( `.game-item:not( .game-inventory )` )
    for ( const item of uItems ) {
      item.dataset.count = this.playerData[ item.dataset.name ]

      if ( !+item.dataset.count )
        item.hidden = true
    }
  }

  logic() {
    if ( this.doneClothes == this.level.clothesToClear ) {
      this.level = levels[ this.level.num ]

      if ( !this.level ) {
        this.stop = true
        this.end()
        return
      }

      this.ui.inventory.firstElementChild.src = `./img/empty.png`
      this.playerData.inventory = null
      this.level.dialogs()
      this.levelBuild()
    }

    for ( const cell of this.map.cellsIterator() ) {
      if ( cell.cloth ) {
        if ( cell.spawner && /despawn/.test( cell.spawner.name ) && cell.clothData.clear ) {
          cell.clothData = { x:null, y:null, cell:{ x:null, y:null } }
          cell.cloth = null
          this.doneClothesArr.push( { x:cell.x, y:cell.y, additionalY:0 } )
          this.doneClothes++
        }
      }
    }
  }

  conveyorLogic() {
    const speed = 2

    for ( const cell of this.map.cellsIterator() ) {
      const clothData = cell.clothData
      const cloth = cell.cloth
      const floor = cell.floor

      if ( floor && /conveyor/.test( floor.name ) ) {
        if ( Math.abs( clothData.x ) <= 24 ) {
          if ( /-l/.test( floor.name ) && clothData.x < 0 || /\.r/.test( floor.name ) && clothData.y >= 0 && Math.abs( clothData.y ) < 3 )
            clothData.x += speed
          else if ( /-r/.test( floor.name ) && clothData.x > 0 || /\.l/.test( floor.name ) && clothData.x <= 0 && Math.abs( clothData.y ) < 3 )
            clothData.x -= speed
        }

        if ( Math.abs( clothData.y ) <= 24 ) {
          if ( /-t/.test( floor.name ) && clothData.y < 0 || /\.b/.test( floor.name ) && clothData.y >= 0 && Math.abs( clothData.x ) < 3 )
            clothData.y += speed
          else if ( /-b/.test( floor.name ) && clothData.y > 0 || /\.t/.test( floor.name ) && clothData.y <= 0 && Math.abs( clothData.x ) < 3 )
            clothData.y -= speed
        }

        if ( Math.abs( clothData.x ) > 24 ) {
          const nextCellX = cell.x + (clothData.x > 0 ? 1 : -1)
          const newX = (clothData.x + (clothData.x > 0 ? -speed : speed)) * -1
          const newCell = this.map.get( nextCellX, cell.y )

          if ( newCell && !newCell.cloth && newCell.washing.item <= 0 ) {
            if ( newCell.entity )
              this.setWashing( newCell, cloth )
            else
              newCell.cloth = cloth

            newCell.clothData = { x:newX, y:0, cell:{ x:nextCellX, y:cell.y }, clear:cell.clothData.clear }
            cell.clothData = { x:null, y:null, cell:{ x:null, y:null }, clear:false }
            cell.cloth = null
          }
        }
        else if ( Math.abs( clothData.y ) > 24 ) {
          const nextCellY = cell.y + (clothData.y > 0 ? 1 : -1)
          const newY = (clothData.y + (clothData.y > 0 ? -speed : speed)) * -1
          const newCell = this.map.get( cell.x, nextCellY )

          if ( newCell && !newCell.cloth && newCell.washing.item <= 0 ) {
            if ( newCell.entity )
              this.setWashing( newCell, cloth )
            else
              newCell.cloth = cloth

            newCell.clothData = { x:0, y:newY, cell:{ x:cell.x, y:nextCellY }, clear:cell.clothData.clear }
            cell.clothData = { x:null, y:null, cell:{ x:null, y:null }, clear:false }
            cell.cloth = null
          }
        }
      }
    }
  }

  draw() {
    const ctx = this.ctx
    const m = this.map
    const { mouse } = this.camera

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )


    // floor
    for ( const cell of m.cellsIterator() ) {
      if ( cell.floor )
        cell.floor.draw( ctx, m.cellX( cell.x ), m.cellY( cell.y ), m.size )
      if ( cell.spawner )
        cell.spawner.draw( ctx, m.cellX( cell.x ), m.cellY( cell.y ), m.size )
    }

    // entities
    for ( const cell of m.cellsIterator() ) {
      const entity = cell.entity
      const washing = cell.washing
      const cloth = cell.cloth


      if ( cloth ) {
        cloth.draw( ctx,
          m.cellX( cell.x ) + m.size / 3 + cell.clothData.x, m.cellY( cell.y ) + m.size / 3 + cell.clothData.y,
          m.size / 3, m.size / 3
        )

        if ( !cell.clothData.clear )
          this.graphics.get( `dirt` ).draw( ctx,
            m.cellX( cell.x ) + m.size / 3 + cell.clothData.x, m.cellY( cell.y ) + m.size / 3 + cell.clothData.y,
            m.size / 3, m.size / 3
          )
      }

      if ( entity )
        entity.draw( ctx, m.cellX( cell.x ), m.cellY( cell.y ) - 9, m.size, m.size / 0.8421 )

      if ( washing.item ) {
        washing.angle++
        washing.time--

        let x = m.cellX( cell.x )
        let y = m.cellY( cell.y )
        let msg = washing.time >= 0  ?  washing.time  :  `Miejsce!`

        ctx.fillStyle = `#333`
        ctx.fillRect( x + 5, y - 5, 40, 15 )
        ctx.fillStyle = `#fff`
        ctx.font = `10px serif`
        ctx.fillText( msg, x + 9, y + 6 )

        ctx.save()
        ctx.translate( x + m.size / 2, y + m.size / 2 )
        ctx.rotate( washing.angle )
        washing.item.draw( ctx, -m.size / 5, -m.size / 5, m.size / 3, m.size / 3 )
        ctx.restore()

        if ( washing.time <= 0 )
          this.takeOutLaudry( cell.x, cell.y )
      }

    }

    ctx.fillStyle = `#0f0`
    ctx.font = `bold 15px serif`

    for ( const doneCloth of this.doneClothesArr.slice() ) {
      let { x, y, additionalY } = doneCloth

      doneCloth.additionalY += 1
      ctx.fillText( `$$$`, m.cellX( x ) + 15, m.cellY( y ) + 20 - additionalY )

      if ( additionalY > 20 )
        this.doneClothesArr.splice( this.doneClothesArr.indexOf( doneCloth ), 1 )
    }

    const marginLeft = m.centered  ?  m.startPos.x  :  0
    const marginTop = m.centered  ?  m.startPos.y  :  0
    const currentCellX = Math.floor( (mouse.x - ctx.canvas.offsetLeft - marginLeft) / m.size )
    const currentCellY = Math.floor( (mouse.y - ctx.canvas.offsetTop - marginTop) / m.size )

    if ( m.get( currentCellX, currentCellY ) ) {
      const mouseCellX = currentCellX * m.size + marginLeft
      const mouseCellY = currentCellY * m.size + marginTop
      const addLinesLen = m.size / 5

      ctx.lineWidth = 3
      ctx.strokeStyle = `#0004`
      ctx.beginPath()

      ctx.moveTo( mouseCellX - addLinesLen, mouseCellY )
      ctx.lineTo( mouseCellX + m.size + addLinesLen, mouseCellY )

      ctx.moveTo( mouseCellX - addLinesLen, mouseCellY + m.size )
      ctx.lineTo( mouseCellX + m.size + addLinesLen, mouseCellY + m.size )

      ctx.moveTo( mouseCellX, mouseCellY - addLinesLen )
      ctx.lineTo( mouseCellX, mouseCellY + m.size + addLinesLen )

      ctx.moveTo( mouseCellX + m.size, mouseCellY - addLinesLen )
      ctx.lineTo( mouseCellX + m.size, mouseCellY + m.size + addLinesLen )

      ctx.stroke()
    }
  }

  levelBuild() {
    const levelMap = this.level.map
    const rows = levelMap.length
    const columns = levelMap[ 0 ].length
    const g = this.graphics
    const uItems = document.querySelectorAll( `.game-item:not( .game-inventory )` )

    this.doneClothes = 0
    this.map.build( columns, rows )

    for ( const item of uItems ) {
      let count = this.level.data[ `${item.dataset.name}s` ] || 0
      this.playerData[ `${item.dataset.name}s` ] = count
      item.dataset.count = count
      item.hidden = false

      if ( !+item.dataset.count )
        item.hidden = true
    }

    for ( let y = 0;  y < rows; ++y )
      for ( let x = 0;  x < columns; ++x ) {
        const mapCell = this.map.get( x, y )
        const levelCell = levelMap[ y ][ x ]

        switch ( levelCell ) {
          case 0: // nothing
            break
          case 1: // nothing
            mapCell.floor = g.get( `floor` )
            break
          case 2: // conveyor
            mapCell.floor = g.get( `conveyor` )
            break
          case 3: // spawn
            mapCell.floor = g.get( `floor` )
            mapCell.spawner = g.get( `spawn` )
            break
          case 4: // despawn
            mapCell.floor = g.get( `floor` )
            mapCell.spawner = g.get( `despawn` )
            break
          case 5: // cloth
            mapCell.floor = g.get( `floor` )
            mapCell.cloth = g.get( `cloth` )
            mapCell.clothData.clear = true
            break
          case 6: // dirtyCloth
            mapCell.floor = g.get( `floor` )
            mapCell.cloth = g.get( `cloth` )
            mapCell.clothData.clear = false
            break
          case 7: // barrel
            mapCell.floor = g.get( `floor` )
            mapCell.entity = g.get( `barrel` )
            break
          case 8: // washmachine
            mapCell.floor = g.get( `floor` )
            mapCell.entity = g.get( `washmachine` )
            break
        }
      }
  }

  onclick() {
    const clickedCell = this.camera.clickedCell
    const activeEle = this.activeOption()

    if ( !clickedCell )
      return

    if ( !clickedCell.cloth && (!clickedCell.entity && !clickedCell.spawner && /washmachine|barrel/.test( activeEle ) ) || activeEle == `conveyor` && clickedCell.floor.name == `floor` ) { // place entity
      console.log( `place entity` )

      if ( this.playerData[ `${activeEle}s` ] > 0 ) {
        document.querySelector( `.game-item[data-name="${activeEle}"]` ).dataset.count -= 1
        this.playerData[ `${activeEle}s` ]--

        if ( activeEle == `conveyor` ) {
          let neighbors = {
            left: (this.map.get( clickedCell.x - 1, clickedCell.y ) || {}).floor || {},
            top: (this.map.get( clickedCell.x, clickedCell.y - 1 ) || {}).floor || {},
            right: (this.map.get( clickedCell.x + 1, clickedCell.y ) || {}).floor || {},
            bottom: (this.map.get( clickedCell.x, clickedCell.y + 1 ) || {}).floor || {}
          }
          let dirs = this.directions
          let postfix = `` // dirs.opposite[ dirs[ this.ui.direction.textContent ] ]

          console.log( neighbors.right )

          if ( /conveyor-..r/.test( neighbors.left.name ) )
            postfix += `l`
          else if ( /conveyor-..b/.test( neighbors.top.name ) )
            postfix += `t`
          else if ( /conveyor-..l/.test( neighbors.right.name ) )
            postfix += `r`
          else if ( /conveyor-..t/.test( neighbors.bottom.name ) )
            postfix += `b`
          else
            postfix += `${dirs.opposite[ dirs[ this.ui.direction.textContent ] ]}`

          postfix += `.${dirs[ this.ui.direction.textContent ]}`

          clickedCell.floor = this.graphics.get( `conveyor-${postfix}`)
        }
        else {
          clickedCell.entity = this.graphics.get( activeEle )
        }

        if ( !this.playerData[ `${activeEle}s` ] )
          this.uItemsSelection()
      }
    }
    else if ( (clickedCell.entity || clickedCell.floor.name != `floor`) && !activeEle ) { // pick up entity
      console.log( `pick up entity` )

      let entity = clickedCell.entity || clickedCell.floor
      let name = entity.name.split( `-` )[ 0 ]

      if ( /barrel|washmachine/.test( name ) ) {
        if ( clickedCell.washing.item ) {
          clickedCell.cloth = clickedCell.washing.item
          clickedCell.washing.item = null
        }

        clickedCell.entity = null
      }
      else if ( /conveyor/.test( name ) ) {
        clickedCell.floor = this.graphics.get( `floor` )
      }

      this.playerData[ `${name}s` ]++
      document.querySelector( `.game-item[data-name="${name}"]` ).dataset.count -= -1
    }
    else if ( clickedCell.entity && activeEle && this.setWashing( clickedCell, activeEle ) ) { // go washing
      console.log( `go washing` )

      this.playerData.inventory = null
      this.ui.inventory.firstElementChild.src = `./img/empty.png`
      this.uItemsSelection()
    }
    else if ( !clickedCell.entity && !clickedCell.cloth && activeEle && activeEle.name == `cloth` ) { // place cloth
      console.log( `place cloth` )

      clickedCell.clothData.x = 0
      clickedCell.clothData.y = 0
      clickedCell.clothData.clear = activeEle.clear
      clickedCell.cloth = activeEle
      this.ui.inventory.firstElementChild.src = `./img/empty.png`
      this.playerData.inventory = null
      this.uItemsSelection()
    }
    else if ( clickedCell.cloth && !activeEle && !this.nonclickableLevels.includes( this.level.num ) ) { // pick up cloth
      console.log( `pick up cloth` )

      this.playerData.inventory = clickedCell.cloth
      this.playerData.inventory.clear = clickedCell.clothData.clear

      if ( clickedCell.clothData.clear )
        this.ui.inventory.firstElementChild.src = `./img/static-cloth.png`
      else
        this.ui.inventory.firstElementChild.src = `./img/static-dirtyCloth.png`

      this.uItemsSelection( this.ui.inventory )

      clickedCell.clothData = { x:null, y:null, clear:false }
      clickedCell.cloth = null
    }
  }

  activeOption() {
    const item = document.querySelector( `.game-item.active` )

    if ( !item )
      return null

    if ( item.classList.contains( `game-inventory` ) )
      return this.playerData.inventory

    return item.dataset.name
  }

  setWashing( cell, item ) {
    if ( !cell.entity || ![`barrel`,`washmachine`].includes( cell.entity.name ) || cell.washing.item )
      return false

    const washMachineName = cell.entity.name

    if ( washMachineName == `barrel` )
      cell.washing.time = 500
    if ( washMachineName == `washmachine` )
      cell.washing.time = 175

    cell.washing.item = item
    cell.clothData = { x:null, y:null, clear:false }

    return true
  }

  takeOutLaudry( x, y ) {
    const cell = this.map.get( x, y )

    let neighbor = this.map.get( x + 1, y )

    if ( neighbor && !neighbor.entity && !neighbor.cloth ) {
      neighbor.cloth = cell.washing.item
      neighbor.clothData.clear = true
      cell.washing.item = null
    }
  }

  set( x, y, name ) {
    let type = `entity`

    if ( /conveyor|floor/.test( name ) )
      type = `floor`
    if ( /readyItem|dirtyItem/.test( name ) )
      type = `spawner`
    if ( /cloth/.test( name ) )
      type = `cloth`

    this.map.get( x, y )[ type ] = this.graphics.get( name )
  }

  resize() {
    const c = this.ui.canvas

    c.width = window.innerWidth
    c.height = window.innerHeight

    this.ctx.imageSmoothingEnabled = false

    this.map.resize()
  }

  uItemsSelection( item ) {
    const uItems = document.querySelectorAll( `.game-item` )

    uItems.forEach( i => i.classList.remove( `active` ) )

    if ( !item || this.playerData[ `${item.dataset.name}s` ] <= 0 )
      return

    item.classList.add( `active` )
  }

  eventsAndTimers() {
    const ui = this.ui
    const mouse = this.camera
    const { map } = this

    ui.canvas.addEventListener( `mousemove`, ({ clientX, clientY }) => {
      const m = this.camera.mouse
      m.x = clientX
      m.y = clientY
    } )

    ui.canvas.addEventListener( `click`, () => {
      const m = this.camera.mouse
      const marginLeft = map.centered  ?  map.startPos.x  :  0
      const marginTop = map.centered  ?  map.startPos.y  :  0
      const currentCellX = Math.floor( (m.x - ui.canvas.offsetLeft - marginLeft) / map.size )
      const currentCellY = Math.floor( (m.y - ui.canvas.offsetTop - marginTop) / map.size )

      this.camera.clickedCell = this.map.get( currentCellX, currentCellY )

      this.onclick()
    } )

    let uItems = document.querySelectorAll( `.game-item` )
    for ( const item of uItems )
      item.addEventListener( `click`, () => this.uItemsSelection( item ) )

    window.addEventListener( `resize`, () => this.resize() )
    document.addEventListener( `keydown`, ({ keyCode }) => {
      if ( keyCode == 82 ) {
        const dirBox = this.ui.direction
        const dir = dirBox.textContent

        switch ( dir ) {
          case `↑`:
            dirBox.textContent = `→`
            break
          case `→`:
            dirBox.textContent = `↓`
            break
          case `↓`:
            dirBox.textContent = `←`
            break
          case `←`:
            dirBox.textContent = `↑`
            break
        }
      }
    } )

    setInterval( () => {
      if ( this.stop )
        return

      this.logic()
      requestAnimationFrame( () => this.draw() )
    }, 1000 / 60 )

    setInterval( () => {
      for ( const texture of this.graphics.values() )
        texture.nextFrame()

      for ( const cell of map.cellsIterator() )
        if ( cell.spawner && cell.spawner.name == `spawn` && Math.random() > .96 && !cell.cloth )
          this.set( cell.x, cell.y, `cloth` )

      this.conveyorLogic()
    }, 1000 / 12 )
  }

  end() {
    alert( `Ambitne zakończenie z braku czasu. Przeszedłeś Pawełkową grę! Brawo, gratuluję osiagnięcia!`)
  }
}