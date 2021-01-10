import Cell, { SandCell } from "./cell.js"

/**
 * @typedef {object} sceneDimensions
 * @property {number} sceneX
 * @property {number} sceneY
 * @property {number} sceneWidth
 * @property {number} sceneHeight
 */

class Game {
  ui = {
    /** @type {HTMLElement} */
    root: null,
    /** @type {HTMLElement} */
    entities: null,
    /** @type {HTMLElement} */
    inventory: null,
    /** @type {HTMLElement} */
    hud: null,
    /** @type {HTMLElement} */
    stageClockHand: null,
    /** @type {HTMLCanvasElement} */
    canvasBackground: null,
    /** @type {HTMLCanvasElement} */
    canvasSprites: null,
  }
  config = {
    cellSize: 10,
    cellsPadding: 0,
    sceneWidth: 100,
    sceneHeight: 50,
    sandLimit: 5,
    mainIntervalTimestamp: 100,
    stageIntervalTimestamp: 4000,
    stageClockPositions: 4,
  }

  /** @type {Cell[][]} */
  scene = [[]]

  /** @type {CanvasRenderingContext2D} */
  ctxBackground = null
  /** @type {CanvasRenderingContext2D} */
  ctxSprites = null

  /** @type {sceneDimensions */
  sceneDimensions = null
  /** @type {Cell[] */
  inventory = []
  /** @type {Object<string,Image} */
  sprites = {}

  constructor( gameRootSelector ) {
    this.setUi( gameRootSelector )
    this.start()
    this.addSprite( `sand`, `./img/sand.png` )

    window.addEventListener( `resize`, this.handleResize )

    this.ui.root.addEventListener( `click`, this.handleClick )
  }

  start = () => {
    const { mainIntervalTimestamp, stageIntervalTimestamp, stageClockPositions } = this.config
    this.initScene()
    this.clearInventory()
    this.updateHud( { reset:true } )

    this.mainInterval = setInterval( () => {
      this.doFalling()
      this.spawnSand( Math.floor( Math.random() * this.scene[ 0 ].length ), 0 )
      // this.spawnSand( 13, 0 )
      requestAnimationFrame( this.draw )

      const snowdrift = this.isCactusBuried()

      if (snowdrift) {
        this.clearArea( snowdrift )
        this.stop()

        setTimeout( this.start, 1000 * 5 )
      }
    }, mainIntervalTimestamp )

    let clockPosition = 0
    this.stageInterval = setInterval( () => {
      ++clockPosition

      this.updateHud( { clockPosition } )

      if (clockPosition === stageClockPositions) {
        this.clearArea( this.cactusEatingArea )

        clockPosition = 0
      }
    }, stageIntervalTimestamp / stageClockPositions )
  }
  stop() {
    clearInterval( this.mainInterval )
    clearInterval( this.stageInterval )
  }
  setUi( gameRootSelector ) {
    this.ui.root = document.querySelector( gameRootSelector )

    const root = this.ui.root

    this.ui.entities = root.querySelector( `.game-entities` )
    this.ui.canvasBackground = root.querySelector( `.game-canvas-background` )
    this.ui.canvasSprites = root.querySelector( `.game-canvas-sprites` )
    this.ui.inventory = root.querySelector( `.game-inventory` )
    this.ui.hud = root.querySelector( `.game-hud` )
    this.ui.stageClock = root.querySelector( `.game-hud-stage_clock` )
    this.ui.stageClockHand = root.querySelector( `.game-hud-stage_clock-hand` )

    this.ctxBackground = this.ui.canvasBackground.getContext( `2d` )
    this.ctxSprites = this.ui.canvasSprites.getContext( `2d` )

    this.handleResize()
  }
  initScene() {
    const { sceneWidth, sceneHeight } = this.config

    this.scene = Array.from(
      { length:sceneHeight },
      () => Array.from( { length:sceneWidth }, () => null )
    )

    const len = this.scene.length
    this.scene[ len - 1 ] = this.scene[ len - 1 ].map( (_, x) => new SandCell( x, len - 1 ) )

    this.cactusEatingArea = []

    for (let start = Math.floor( this.scene[ 0 ].length / 2 ) - 4, i = 0;  i < 8;  ++i) {
      this.cactusEatingArea.push( { x:(start + i), y:(this.scene.length - 2) } )
    }

    this.sceneDimensions = this.getSceneDimensions( this.cellSpadding )
    const dim = this.sceneDimensions

    this.ui.entities.innerHTML = ``

    this.addEntity(
      `cactus`,
      dim.sceneX + dim.sceneWidth / 2 - 50,
      dim.sceneY + dim.sceneHeight - 100,
      100
    )
  }
  draw = () => {
    const { scene, ctxBackground:ctx } = this
    const { cellSize, cellsPadding } = this.config
    const { sceneX, sceneY, sceneWidth, sceneHeight } = this.sceneDimensions
    const addPaddingToCoord = coord => coord * (cellSize + cellsPadding) + cellsPadding

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.beginPath()

    // ctx.rect( sceneX, sceneY, sceneWidth, sceneHeight )
    // ctx.fillStyle = `#222`
    // ctx.fill()

    ctx.beginPath()
    scene.forEach( (row, y) => row.forEach( (cell, x) => {
      if (cell) ctx.rect( sceneX + addPaddingToCoord( x ), sceneY + addPaddingToCoord( y ), cellSize, cellSize )
    } ) )

    ctx.fillStyle = `#ffc764`
    ctx.fill()
  }
  doFalling() {
    const { scene } = this
    const directionsCheckingOrder = [
      { jumpX:0, jumpY:1 },
      { jumpX:1, jumpY:1 },
      { jumpX:-1, jumpY:1 },
    ]

    for (let y = scene.length - 1;  y >= 0;  --y) {
      scene[ y ].forEach( (cell, x ) => {
        if (this.getSceneCell( x, y )?.falling) {

          for (const { jumpX, jumpY } of directionsCheckingOrder) {
            if (this.moveCell( x, y, x + jumpX, y + jumpY )) break
          }
        }
      } )
    }
  }
  spawnSand( x, y ) {
    if (this.getSceneCell( x, y ) !== undefined) this.scene[ y ][ x ] = new SandCell( x, y, true )
  }


  //


  getSceneDimensions( padding=0 ) {
    const { scene, ctxBackground:{ canvas } } = this
    const { cellSize } = this.config

    return {
      sceneX: ((canvas.width - scene[ 0 ].length * (cellSize + padding) - padding)) / 2,
      sceneY: ((canvas.height - scene.length * (cellSize + padding) - padding)) / 2,
      sceneWidth: scene[ 0 ].length * (cellSize + padding) + padding,
      sceneHeight: scene.length * (cellSize + padding) + padding
    }
  }
  getSceneCell( x, y ) {
    return this.scene[ y ]?.[ x ]
  }
  moveCell( x, y, newX, newY, onlyIfEmpty=true ) {
    const newCell = this.getSceneCell( newX, newY )
    const cell = this.scene[ y ]?.[ x ]

    if (newCell === undefined || cell === undefined) return false
    if (newCell !== null && onlyIfEmpty) return false

    cell.x = newX
    cell.y = newY

    this.scene[ newY ][ newX ] = cell
    this.scene[ y ][ x ] = null

    return true
  }
  addEntity( imgName, x=0, y=0, width=null, height=null ) {
    const img = new Image()

    img.src = `./img/${imgName}.png`
    img.className = `game-entity`

    img.style.left = `${x}px`
    img.style.top = `${y}px`

    if (width) img.width = width
    if (height) img.height = height

    this.ui.entities.appendChild( img )
  }
  isCactusBuried() {
    const { scene } = this
    const cactusRows = { from:(scene.length - 9), to:(scene.length - 1) }

    let temp = Math.floor( scene[ 0 ].length / 2 ) - 4
    const cactusColumns = { from:temp, to:(temp + 8) }

    const cactusCells = []

    for (let y = cactusRows.from;  y < cactusRows.to;  ++y) {
      for (let x = cactusColumns.from;  x < cactusColumns.to;  ++x) {
        if (!this.scene[ y ][ x ]) return null

        cactusCells.push( this.scene[ y ][ x ] )
      }
    }

    return cactusCells
  }
  clearArea( coords ) {
    coords.forEach( ({ x, y }) => this.scene[ y ][ x ] = null )
  }
  addToInventory( cell ) {
    const items = Array.from( this.ui.inventory.querySelectorAll( `.game-inventory-item` ) )
    const item = items.find( ({ dataset }) => dataset.type === cell.type )

    if (item) {
      item.dataset.count -= -1
    } else {
      const item = document.createElement( `div` )
      const img = new Image( 50, 50 )

      img.src = `./img/${cell.type}.png`

      item.className = `game-inventory-item`
      item.dataset.count = 1
      item.dataset.type = cell.type
      item.appendChild( img )

      this.ui.inventory.appendChild( item )
    }

    this.inventory.push( cell )
  }
  removeFromInventory( type ) {
    const item = this.ui.inventory.querySelector( `[data-type="${type}"]` )
    const index = this.inventory.findIndex( cell => cell.type === type )

    if (index === -1) return false

    this.inventory.splice( index, 1 )

    item.dataset.count -= 1

    return true
  }
  clearInventory() {
    this.ui.inventory.innerHTML = ``
    this.inventory = []
  }
  addSprite( name, src ) {
    const sprite = new Image()

    sprite.src = src

    this.sprites[ name ] = sprite
  }
  updateHud( { reset, clockPosition } ) {
    const { stageClockHand } = this.ui
    const { stageClockPositions } = this.config

    if (clockPosition) {
      stageClockHand.style.transform = `rotate( ${clockPosition * 360 / stageClockPositions}deg )`
    }
  }


  //


  handleResize = () => {
    this.ui.canvasBackground.width = window.innerWidth
    this.ui.canvasBackground.height = window.innerHeight

    this.ui.canvasSprites.width = window.innerWidth
    this.ui.canvasSprites.height = window.innerHeight

    if (this.ctxBackground) this.sceneDimensions = this.getSceneDimensions()
  }
  handleClick = ({ layerX, layerY }) => {
    const { sceneDimensions, inventory } = this
    const { cellSize, sandLimit } = this.config

    const x = layerX - sceneDimensions.sceneX
    const y = layerY - sceneDimensions.sceneY

    const cellX = Math.floor( x / cellSize )
    const cellY = Math.floor( y / cellSize )

    const cell = this.getSceneCell( cellX, cellY )

    if (!cell) {
      if (this.removeFromInventory( `sand` )) {
        this.spawnSand( cellX, cellY )
      }
    } else if (cell.type === `sand` && inventory.filter( ({ type }) => type === `sand` ).length < sandLimit) {
      this.clearArea( [ { x:cellX, y:cellY } ] )
      this.addToInventory( cell )
    }
  }
}

window.game = new Game( `.game` )