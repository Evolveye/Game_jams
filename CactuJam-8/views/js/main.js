import Cell, { SandCell, BarrierCell, LavaCell } from "./cell.js"
import Cloud from "./cloud.js"
import Ray from "./ray.js"

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
    /** @type {HTMLElement} */
    transportedItems: null,
    /** @type {HTMLElement} */
    capacity: null,
    /** @type {HTMLElement} */
    eatedItems: null,
    /** @type {HTMLElement} */
    highlight: null,
    /** @type {HTMLElement} */
    highlighter: null,
    /** @type {HTMLElement} */
    hp: null,
    /** @type {HTMLElement} */
    highlightContent: null,
    /** @type {HTMLCanvasElement} */
    canvasBackground2: null,
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
    initialCapacity: 1,
    initialSceneRandomSand: 100,
    initialScenePyramidSandCount: 50,
    mainIntervalTimestamp: 100,
    stageIntervalTimestamp: 4000,
    stageClockPositions: 12,
    newPointPerTransportedItems: Infinity,
    newPointPerEatedItems: 10,
    initialHp: 20,

    highlightScreens: {
      capacity: `
        <h1>Wzmacniasz się!</h1>
        <p>Twój udźwig zwiększył się</p>
      `,
      introToStageTwo: `
        <h1>Nigdy nie przeceniaj mistycznych kaktusów</h1>
        <p><strong style="color:red;">ETAP 1 ZAKOŃCZONY</strong></p>
        <p>
          Wyglada na to, że kaktus jeszcze nie jest w pełni zwiędły i
          resztkami swych wzywa Cię do dostarczenia pokarmu.
          Skoro tak trudno Ci zebrać pokarm, to kaktus postarał się o jego dostawę.
          Większa ilość pożywienia powinna być prostsza w złapaniu i przeniesieniu.
        </p>
      `,
      endByHp: `
        <h1>Zwiędłeś!</h1>
        <p>
          Twoje życie spadło do zera.
          To z kolei oznacza, że nie zadbałeś o zdrowie naszego kochanego kaktusa.
          Teraz świat stanie w płomieniach a Ty już nigdy nie zobaczysz małego kotka ani pieska.
        </p>
      `,
      sandCloud: `
        <h1>Sandcloud</h1>
        <p>
          Chmura piaskowa. Byt przywiewajacy powodujący zamiecie piaskowe.
          Kaktus jest w stanie przywoływać te nieprzyjemne chmury w momencie gdy nic nie zje.
        </p>
        <p>To co, może tym razem obsypiesz kaktusa pokarmem w ramach rekompensaty?</p>
      `,
      overfedCactus: `
        <h1>Przekarmiony</h1>
        <p>
          Nie sądziłem, że Ci się to uda, ale przekarmiłeś kaktusa.
          Dosłownie zasypałeś go piachem. Dumny z siebie jesteś?
        </p>
      `,
      introToStageThree: `
        <h1>Wulkan!</h1>
        <p><strong style="color:red;">ETAP 2 ZAKOŃCZONY</strong></p>
        <p>
          Gniew kaktusa spowodowała wyrwę w czasze planety.
          Teraz chmury piaskowe będą nadciągać tutaj non stop,
          a kaktus nie przeżyje już kolejnego ataku ze strony swego dokarmiacza!
        </p>
      `,
      // introToStageThree: `
      //   <h1>Przekarmiony</h1>
      //   <p><strong style="color:red;">ETAP 2 ZAKOŃCZONY</strong></p>
      //   <p>Gniew kaktusa spowodował wyrwę w ziemi. Wyglada na to, ze to krater wulkaniczny!</p>
      //   <p>
      //     Teraz chmury piaskowe będą nadciągać tutaj non stop,
      //     a kaktus nie przeżyje już kolejnego ataku ze strony swego dokarmiacza!
      //   </p>
      // `,
      realEndByHp: `
        <h1>Zwiędłeś!</h1>
        <p>
          Nie masz godności ani rozumu człowieka.
          Doprowadziłes nas wszystkich do klęski już drugi raz.
          Zginiesz marnie...
        </p>
        <p>Tak jak wszyscy inni...</p>
        <p>Oko nie będzie zadowolone</p>
        <p><strong style="color:red;">PRZEGRANA</strong></p>
      `,
    }
  }

  /** @type {Cell[][]} */
  scene = [[]]

  /** @type {CanvasRenderingContext2D} */
  ctxBackground2 = null
  /** @type {CanvasRenderingContext2D} */
  ctxBackground = null
  /** @type {CanvasRenderingContext2D} */
  ctxSprites = null

  /** @type {sceneDimensions */
  sceneDimensions = null
  /** @type {Object<string,Image} */
  sprites = {}
  /** @type {Cell[] */
  inventory = []
  /** @type {Cloud[]} */
  clouds = []
  /** @type {Ray[]} */
  rays = []

  transportedItemsCount = 0
  eatedItems = 0
  hp = 0
  stage = 1
  capacity = this.config.initialCapacity
  isPaused = false
  nextCapacityUpgradePoints = this.config.initialCapacity

  constructor( gameRootSelector ) {
    this.setUi( gameRootSelector )

    window.addEventListener( `resize`, this.handleResize )

    this.ui.root.addEventListener( `click`, this.handleClick )

    Promise.all( [
      this.addSprite( `sand`, `./img/sand.png` ),
      this.addSprite( `heart`, `./img/heart.png` ),
      this.addSprite( `cloud`, `./img/cloud.png` ),
    ] ).then( this.start )
  }

  start = () => {
    const {
      mainIntervalTimestamp,
      stageIntervalTimestamp,
      stageClockPositions,
      newPointPerEatedItems,
      initialCapacity,
      highlightScreens: hlScreens,
    } = this.config

    this.stop()
    this.initScene()
    this.clearInventory()
    this.setDefaults()
    this.updateHud( { reset:true } )

    // for (let i = 0;  i < 120;  ++i) {
    //   this.spawnSand( Math.floor( this.scene[ 0 ].length / 2 ) )
    //   this.doFalling()
    // }

    this.mainInterval = setInterval( () => {
      if (this.isPaused) return

      this.doFalling()
      // this.spawnSand() // stage 1
      // this.spawnSand( 13, 0 ) // stage 2
      requestAnimationFrame( this.draw )

      if (this.isCactusBuried()) this.showScreen( hlScreens.overfedCactus, this.startStage3 )
    }, mainIntervalTimestamp )

    let clockPosition = 0
    this.stageInterval = setInterval( () => {
      if (this.isPaused) return

      ++clockPosition

      this.moveClouds()
      this.updateHud( { clockPosition } )

      if (clockPosition === stageClockPositions) {
        if (this.stage === 3) this.spawnCloudFromLava()
        let spawnCloud = true

        this.cactusEatingArea.forEach( ({ x, y }) => {
          if (this.getSceneCell( x, y )) {
            ++this.eatedItems
            ++this.hp

            spawnCloud = false
          } else {
            --this.hp
          }
        } )

        if (spawnCloud && this.stage === 2) this.spawnCloud()
        if (this.hp < 0) this.hp = 0

        this.updateHud( { eatedItems:this.eatedItems, hp:this.hp } )
        this.clearArea( this.cactusEatingArea )

        if ((this.eatedItems / (this.capacity - initialCapacity + 1)) >= this.nextCapacityUpgradePoints) {
          this.nextCapacityUpgradePoints += 2

          this.showScreen( hlScreens.capacity, () =>
            this.updateHud( { capacity:++this.capacity } )
          )
        }
        if (this.hp === 0) {
          const buttons = [ {
            content: `Restart`,
            onclick: closeFn => {
              closeFn()
              this.start()
            }
          } ]

          if (this.stage === 1) buttons.push( {
            content: `Patrz jak kaktus kona`,
            onclick: closeFn => {
              closeFn()

              Game.wait( 5000, () => this.showScreen( hlScreens.introToStageTwo, this.startStage2 ) )
            }
          } )

          this.showScreen( this.stage === 1 ? hlScreens.endByHp : hlScreens.realEndByHp, buttons)
        }

        clockPosition = 0
      }
    }, stageIntervalTimestamp / stageClockPositions )
  }
  stop() {
    clearInterval( this.mainInterval )
    clearInterval( this.stageInterval )
  }
  pause() {
    this.isPaused = true
  }
  resume = () => {
    this.isPaused = false
  }
  setUi( gameRootSelector ) {
    this.ui.root = document.querySelector( gameRootSelector )

    const root = this.ui.root

    this.ui.entities = root.querySelector( `.game-entities` )
    this.ui.canvasBackground2 = root.querySelector( `.game-canvas-background2` )
    this.ui.canvasBackground = root.querySelector( `.game-canvas-background` )
    this.ui.canvasSprites = root.querySelector( `.game-canvas-sprites` )
    this.ui.inventory = root.querySelector( `.game-inventory` )

    this.ui.hud = root.querySelector( `.game-hud` )
    this.ui.stageClock = root.querySelector( `.game-hud-stage_clock` )
    this.ui.stageClockHand = root.querySelector( `.game-hud-stage_clock-hand` )
    this.ui.transportedItems = root.querySelector( `.game-hud-transported_items` )
    this.ui.capacity = root.querySelector( `.game-hud-capacity` )
    this.ui.eatedItems = root.querySelector( `.game-hud-eated_items` )
    this.ui.hp = root.querySelector( `.game-hud-hp` )

    this.ui.highlight = root.querySelector( `.game-highlight` )
    this.ui.highlighter = root.querySelector( `.game-highlight-highlighter` )
    this.ui.highlightContent = root.querySelector( `.game-highlight-content` )

    this.ui.highlight.style.display = `none`

    this.ctxBackground2 = this.ui.canvasBackground2.getContext( `2d` )
    this.ctxBackground = this.ui.canvasBackground.getContext( `2d` )
    this.ctxSprites = this.ui.canvasSprites.getContext( `2d` )

    this.handleResize()
  }
  initScene() {
    const {
      cellSize,
      sceneWidth,
      sceneHeight,
      initialSceneRandomSand,
      initialScenePyramidSandCount
    } = this.config

    this.clouds = Array.from( { length:sceneWidth }, () => null )
    this.scene = Array.from(
      { length:sceneHeight },
      () => Array.from( { length:sceneWidth }, () => null )
    )

    const len = this.scene.length
    this.scene[ len - 1 ] = this.scene[ len - 1 ].map( (_, x) => new BarrierCell( x, len - 1 ) )
    this.scene[ len - 2 ] = this.scene[ len - 1 ].map( (_, x) => new SandCell( x, len - 2 ) )

    this.cactusEatingArea = []

    for (let start = Math.floor( this.scene[ 0 ].length / 2 ) - 4, i = 0;  i < 8;  ++i) {
      this.cactusEatingArea.push( { x:(start + i), y:(this.scene.length - 3) } )
    }

    for (let i = 0; i < initialSceneRandomSand; ++i) {
      this.spawnSand( Math.floor( Math.random() * this.scene[ 0 ].length ), 0 )
      this.doFalling()
    }

    for (let i = 0; i < initialScenePyramidSandCount; ++i) {
      this.spawnSand( 10, 0 )
      this.doFalling()
    }

    for (let i = 0;  i < sceneHeight;  ++i) this.doFalling()

    this.sceneDimensions = this.getSceneDimensions( this.cellSpadding )
    const dim = this.sceneDimensions
    const hudHeight = Number( getComputedStyle( this.ui.hud ).height.split( `px` )[ 0 ] )

    this.ui.entities.innerHTML = ``

    this.addEntity(
      `cactus`,
      dim.sceneX + dim.sceneWidth / 2 - 50,
      dim.sceneY + dim.sceneHeight - 100 - cellSize + hudHeight,
      100
    )
  }
  draw = () => {
    const { scene, clouds, ctxSprites:ctxS, ctxBackground:ctx } = this
    const { cellSize, cellsPadding } = this.config
    const { sceneX, sceneY, sceneHeight } = this.sceneDimensions
    const addPaddingToCoord = coord => coord * (cellSize + cellsPadding) + cellsPadding

    ctxS.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.beginPath()

    // ctx.rect( sceneX, sceneY, sceneWidth, sceneHeight )
    // ctx.fillStyle = `#222`
    // ctx.fill()

    clouds.filter( Boolean ).forEach( ({ x }) => {
      ctxS.drawImage(
        this.sprites.cloud,
        sceneX + addPaddingToCoord( x ) - cellSize / 1.2,
        sceneY + addPaddingToCoord( 2 ) - cellSize / 2,
        cellSize * 3,
        cellSize * 2,
      )
    } )

    /** @type {Cell[]} */
    const cells = scene.flat().filter( Boolean )

    ctx.beginPath()
    cells.filter( cell => cell instanceof SandCell ).forEach( cell => {
      ctx.rect( sceneX + addPaddingToCoord( cell.x ), sceneY + addPaddingToCoord( cell.y ), cellSize, cellSize )
    } )

    ctx.fillStyle = `#ffc764`
    ctx.fill()

    ctx.beginPath()
    cells.filter( cell => cell instanceof LavaCell ).forEach( cell => {
      ctx.rect( sceneX + addPaddingToCoord( cell.x ), sceneY + addPaddingToCoord( cell.y ), cellSize, cellSize )
    } )

    ctx.fillStyle = `#f22`
    ctx.fill()

    this.rays.forEach( ({ x }) => ctx.rect( sceneX + addPaddingToCoord( x ), sceneY, cellSize, sceneHeight ) )

    ctx.fillStyle = `#f44`
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
  moveClouds() {
    const clouds = Array.from( { length:this.config.sceneWidth }, () => null )

    this.clouds.filter( Boolean ).forEach( cloud => {
      let jump = cloud.isGoingToRight ? 1 : -1

      if (clouds[ cloud.x + jump ] === undefined) {
        cloud.isGoingToRight = !cloud.isGoingToRight
        jump *= -1
      }

      while (clouds[ cloud.x + jump ] !== null) {
        if (clouds[ cloud.x + jump ] === undefined) return
        else jump += jump
      }

      clouds[ cloud.x + jump ] = cloud
      cloud.x += jump

      if (Math.random() > 0.8) this.spawnSand( cloud.x, 2 )
    } )

    this.clouds = clouds
  }
  spawnSand( x, y ) {
    if (x === undefined) x = Math.floor( Math.random() * this.scene[ 0 ].length )
    if (y === undefined) y = 0

    if (this.getSceneCell( x, y ) !== undefined) this.scene[ y ][ x ] = new SandCell( x, y, true )
  }
  spawnCloud( x, isGoingToRight ) {
    if (x === undefined) x = Math.floor( Math.random() * this.scene[ 0 ].length )
    if (isGoingToRight === undefined) isGoingToRight = Boolean( Math.floor( Math.random() * 2 ) )

    this.clouds[ x ] = new Cloud( x, isGoingToRight )
  }
  spawnCloudFromLava() {
    /** @type {LavaCell[]} */
    const lavaCells = this.scene.flat().filter( cell => cell instanceof LavaCell )
    const index = Math.floor( Math.random() * lavaCells.length )
    const lavaCell = lavaCells[ index ]

    const rayIndex = this.rays.push( new Ray( lavaCell.x, lavaCell.y ) ) - 1

    this.spawnCloud( lavaCell.x )

    setTimeout( () => this.rays.splice( rayIndex, 1 ), this.config.mainIntervalTimestamp * 4 )
  }
  startStage2 = () => {
    console.info( `stage 2` )

    const { cellSize, highlightScreens } = this.config
    const dim = this.sceneDimensions
    const hudHeight = Number( getComputedStyle( this.ui.hud ).height.split( `px` )[ 0 ] )
    this.stage = 2

    this.pause()
    this.flicking( `#5f5`, 100, 3000 ).then( () => {
      this.spawnCloud( 2, true )
      this.draw()
      this.setHighLightScreen( {
        x: dim.sceneX + (2 - 2) * cellSize,
        y: hudHeight + dim.sceneY + (2 - 2) * cellSize,
        width: cellSize * 5,
        height: cellSize * 5,
      }, highlightScreens.sandCloud, [
        {
          content: `Ok`,
          onclick: closeFn => {
            closeFn()
            this.resume()
          }
        }
      ] )
    } )

    return false
  }
  startStage3 = () => {
    console.info( `stage 3` )

    const isCactusBuried = this.isCactusBuried()
    const { scene, sceneDimensions:dim, config:{ cellSize, highlightScreens:hlScreens } } = this
    const hudHeight = Number( getComputedStyle( this.ui.hud ).height.split( `px` )[ 0 ] )

    this.stage = 3

    if (!isCactusBuried) return

    this.pause()
    // this.clearArea( isCactusBuried )
    // this.draw()

    this.flicking( `#faa`, 70, 0 ).then( () =>
      this.clearArea( scene.slice( scene.length - 9, scene.length - 2 ).flat().filter( Boolean )  )
    )
      .then( () => {
        const { scene } = this
        const lastSceneY = scene.length - 1
        const cactusRows = { from:(scene.length - 9), to:lastSceneY }
        const cactusColumns = { from:1, to:4 }
        const coords = []

        for (let y = cactusRows.from;  y < cactusRows.to;  ++y) {
          for (let x = cactusColumns.from;  x < cactusColumns.to;  ++x) {
            coords.push( { x, y } )
          }
        }

        this.clearArea( coords )

        for (let x = cactusColumns.from;  x < cactusColumns.to;  ++x) {
          scene[ lastSceneY ][ x ] = new LavaCell( x, lastSceneY )
        }
      } )
      .then( () => this.draw() )
      .then( () => this.setHighLightScreen( {
        x: dim.sceneX + (2 - 2) * cellSize,
        y: hudHeight + dim.sceneHeight + cellSize * 9,
        width: cellSize * 5,
        height: cellSize * 5,
      }, hlScreens.introToStageThree, [ { content:`Ok`, onclick: closeFn => {
        closeFn()
        this.resume()
      } } ] ) )
    // const { cellSize, highlightScreens } = this.config
    // const dim = this.sceneDimensions
    // const hudHeight = Number( getComputedStyle( this.ui.hud ).height.split( `px` )[ 0 ] )
    // this.stage = 2

    // this.pause()
    // this.flicking( `#5f5`, 100, 3000 ).then( () => {
    //   this.spawnCloud( 2, true )
    //   this.draw()
    //   this.setHighLightScreen( {
    //     x: dim.sceneX + (2 - 2) * cellSize,
    //     y: hudHeight + dim.sceneY + (2 - 2) * cellSize,
    //     width: cellSize * 5,
    //     height: cellSize * 5,
    //   }, highlightScreens.sandCloud, [
    //     {
    //       content: `Ok`,
    //       onclick: closeFn => {
    //         closeFn()
    //         this.resume()
    //       }
    //     }
    //   ] )
    // } )
    return false
  }


  //


  setDefaults() {
    this.isPaused = false
    this.eatedItems = 0
    this.capacity = this.config.initialCapacity
    this.nextCapacityUpgradePoints = this.config.initialCapacity
    this.hp = this.config.initialHp
    this.stage = 1

    this.ctxBackground2.imageSmoothingEnabled = false
    this.ctxBackground.imageSmoothingEnabled = false
    this.ctxSprites.imageSmoothingEnabled = false
  }
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
    const cell = this.getSceneCell( x, y )

    if (newCell === undefined || cell === undefined) return false
    if (newCell !== null && onlyIfEmpty) {
      if (newCell instanceof LavaCell) this.scene[ y ][ x ] = null
      return false
    }

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
        if (!this.scene[ y ][ x ]) return false

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

    return new Promise( res => sprite.onload = res )
  }
  updateHud( { reset, clockPosition, transportedItemsCount, capacity, eatedItems, hp } ) {
    const { stageClockPositions, initialCapacity, initialHp } = this.config
    const isNotUndef = something => something !== undefined

    if (isNotUndef( clockPosition )) {
      this.ui.stageClockHand.style.transform = `rotate( ${clockPosition * 360 / stageClockPositions}deg )`
    } else if (reset) {
      this.ui.stageClockHand.style.transform = `rotate( 0deg )`
    }

    if (isNotUndef( transportedItemsCount )) {
      this.ui.transportedItems.dataset.count = transportedItemsCount
    } else if (reset) {
      this.ui.transportedItems.dataset.count = 0
    }

    if (isNotUndef( capacity )) {
      this.ui.capacity.dataset.count = capacity
    } else if (reset) {
      this.ui.capacity.dataset.count = initialCapacity
    }

    if (isNotUndef( eatedItems )) {
      this.ui.eatedItems.dataset.count = eatedItems
    } else if (reset) {
      this.ui.eatedItems.dataset.count = 0
    }

    if (isNotUndef( hp )) {
      this.ui.hp.dataset.count = hp
    } else if (reset) {
      this.ui.hp.dataset.count = initialHp
    }
  }
  /**
   * @typedef {object} ButtonData
   * @property {string} content
   * @property {(closeFn:()=>void) => void} onclick
   */
  /**
   * @param {{ x:number y:number width:number height:number }} highlightArea
   * @param {string} htmlContent
   * @param {ButtonData[]} buttonsData
   */
  setHighLightScreen( highlightArea, htmlContent, buttonsData=[] ) {
    const { highlight, highlighter, highlightContent:content } = this.ui
    const { sceneHeight } = this.sceneDimensions
    const contentHeight = getComputedStyle( content ).height
    const { x, y, width, height } = highlightArea || { x:0, y:0, width:0, height:0 }

    highlighter.style.left = `${x}px`
    highlighter.style.top = `${y}px`
    highlighter.style.width = `${width}px`
    highlighter.style.height = `${height}px`

    content.innerHTML = htmlContent

    if (buttonsData.length) {
      const buttons = document.createElement( `div` )

      buttons.className = `game-highlight-content-buttons`

      for (const { content, onclick } of buttonsData) {
        const btn = document.createElement( `button` )

        btn.textContent = content
        btn.className = `game-highlight-content-button`
        btn.onclick = () => onclick( () => highlight.style.display = `none` )

        buttons.appendChild( btn )
      }

      content.appendChild( buttons )
    }

    if (highlightArea) {
      console.log( y , sceneHeight / 2 )
      content.style.left = `50%`
      content.style.top = `${y > sceneHeight / 2 ? y - contentHeight - 20 : y + height + 20}px`
      content.style.transform = `translateX( -50% )`
    } else {
      content.style.left = `50%`
      content.style.top = `50%`
      content.style.transform = `translate( -50%, -50% )`
    }

    highlight.style.display = `block`
  }
  /**
   * @param {string} htmlContent
   * @param {ButtonData[]|() => void} [buttonsOrOkCb]
   */
  showScreen( htmlContent, buttonsOrOkCb=null ) {
    const defaultButtons = [
      {
        content: `Ok`,
        onclick: closeFn => {
          closeFn()

          if (typeof buttonsOrOkCb === `function`) {
            if (buttonsOrOkCb() !== false) this.resume()
          } else this.resume()
        }
      }
    ]

    this.pause()
    this.setHighLightScreen( null, htmlContent, buttonsOrOkCb?.length ? buttonsOrOkCb : defaultButtons  )
  }
  async flicking( color, speed, ms ) {
    const ctx = this.ctxBackground2
    // const dim = this.sceneDimensions
    // const args = [ dim.sceneX, dim.sceneY, dim.sceneWidth, dim.sceneHeight ]
    const args = [ 0, 0, ctx.canvas.width, ctx.canvas.height ]
    const startTime = Date.now()

    ctx.fillStyle = color

    while (startTime > Date.now() - ms) {
      ctx.fillRect( ...args )
      await Game.wait( speed / 2 )
      ctx.clearRect( ...args )
      await Game.wait( speed / 2 )
    }
  }


  //


  handleResize = () => {
    const hudHeight = Number( getComputedStyle( this.ui.hud ).height.split( `px` )[ 0 ] )

    this.ui.canvasBackground2.width = window.innerWidth
    this.ui.canvasBackground2.height = window.innerHeight - hudHeight

    this.ui.canvasBackground.width = window.innerWidth
    this.ui.canvasBackground.height = window.innerHeight - hudHeight

    this.ui.canvasSprites.width = window.innerWidth
    this.ui.canvasSprites.height = window.innerHeight - hudHeight

    if (this.ctxBackground) this.sceneDimensions = this.getSceneDimensions()
  }
  handleClick = ({ layerX, layerY }) => {
    const { sceneDimensions, inventory, capacity } = this
    const { cellSize, newPointPerTransportedItems, highlightScreens } = this.config

    const x = layerX - sceneDimensions.sceneX
    const y = layerY - sceneDimensions.sceneY

    const cellX = Math.floor( x / cellSize )
    const cellY = Math.floor( y / cellSize )

    const cell = this.getSceneCell( cellX, cellY )

    if (!cell) {
      if (this.removeFromInventory( `sand` )) {
        this.transportedItemsCount++

        this.spawnSand( cellX, cellY )
        this.updateHud( { transportedItemsCount:this.transportedItemsCount } )

        if (this.transportedItemsCount % newPointPerTransportedItems === 0) {
          this.showScreen( highlightScreens.capacity, () =>
            this.updateHud( { capacity:++this.capacity } )
          )
        }
      }
    } else if (cell.type === `sand` && inventory.filter( ({ type }) => type === `sand` ).length < capacity) {
      this.clearArea( [ { x:cellX, y:cellY } ] )
      this.addToInventory( cell )
    }
  }


  //


  static wait = (ms, cb) => new Promise( res => setTimeout( () => {
    if (cb) cb()

    res()
  }, ms ))
}

window.game = new Game( `.game` )