import Cell from "./cell.js"

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
    /** @type {HTMLCanvasElement} */
    canvasBackground: null,
    /** @type {HTMLCanvasElement} */
    canvasSprites: null,
  }

  /** @type {Cell[][]} */
  scene = [[]]

  /** @type {CanvasRenderingContext2D} */
  ctxBackground = null
  /** @type {CanvasRenderingContext2D} */
  ctxSprites = null

  cellSize = 10
  cellSpadding = 0
  sceneWidth = 100
  sceneHeight = 50
  /** @type {sceneDimensions */
  sceneDimensions = null

  constructor( gameRootSelector ) {
    this.setUi( gameRootSelector )
    this.start()

    window.addEventListener( `resize`, this.resize )
  }

  start = () => {
    this.initScene()

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
    }, 1 )

    this.stageInterval = setInterval( () => {
      this.clearArea( this.cactusEatingArea )
    }, 100 )
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

    this.ctxBackground = this.ui.canvasBackground.getContext( `2d` )
    this.ctxSprites = this.ui.canvasSprites.getContext( `2d` )

    this.resize()
  }
  resize = () => {
    this.ui.canvasBackground.width = window.innerWidth
    this.ui.canvasBackground.height = window.innerHeight

    this.ui.canvasSprites.width = window.innerWidth
    this.ui.canvasSprites.height = window.innerHeight

    if (this.ctxBackground) this.sceneDimensions = this.getSceneDimensions()
  }
  initScene() {
    this.scene = Array.from(
      { length:this.sceneHeight },
      () => Array.from( { length:this.sceneWidth }, () => null )
    )

    const len = this.scene.length
    this.scene[ len - 1 ] = this.scene[ len - 1 ].map( (_, x) => new Cell( x, len - 1 ) )

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
    const { scene, ctxBackground:ctx, cellSize, cellSpadding } = this
    const { sceneX, sceneY, sceneWidth, sceneHeight } = this.sceneDimensions
    const addPaddingToCoord = coord => coord * (cellSize + cellSpadding) + cellSpadding

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
    if (this.getSceneCell( x, y ) !== undefined) this.scene[ y ][ x ] = new Cell( x, y, true )
  }


  //


  getSceneDimensions( padding=0 ) {
    const { scene, cellSize, ctxBackground:{ canvas } } = this

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
}

window.game = new Game( `.game` )
