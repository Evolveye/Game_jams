document.body.innerHTML = /* html */ `
  <canvas>
`

const data = {
  ctx: document.body.querySelector( `canvas` ).getContext( `2d` ),
  intervalId: null,
  tileSize: 50,
  layer1: [],
  layer2: [],
  layer3: [],
  userLogic() {},
  userDraw() {},
  sprites: {},
  /** @type {Level[]} */
  levels: [],
  /** @type {Level} */
  level: null
}

data.ctx.canvas.width = window.innerWidth
data.ctx.canvas.height = window.innerHeight
data.ctx.imageSmoothingEnabled = false

class Level {
  constructor( { tiles, script } ) {
    this.tiles = tiles
    this.script = script
  }
}
class Sprite {
  /**
   * @param {Object} param0
   * @param {String} param0.src Path without extension and without direction informations (__./img__ instead __./img-0010.png__)
   */
  constructor( { src, frames, framesInRow } ) {
    this.image = new Image()
    this.image.src = src
    this.frames = frames
    this.columns = framesInRow
    this.rows = Math.ceil( frames / framesInRow )
    this.frameWidth = 0
    this.frameHeight = 0
    this.x = 1
    this.y = 1

    this.image.onload = () => {
      this.frameWidth = this.image.width / framesInRow
      this.frameHeight = this.image.height / this.rows
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  drawframe( ctx, left, top, width, height ) {
    const { image, x, y, frameWidth, frameHeight } = this

    ctx.drawImage( image, (x - 1) * frameWidth, (y - 1) * frameHeight, frameWidth, frameHeight, left, top, width, height )
  }

  nextFrame() {
    this.x++

    if ( this.x == this.width ) {
      this.x = 1
      this.y++
    }
    if ( this.y == this.height )
      this.y = 1
  }
}
Sprite.sprites = new Map

function start() {
  console.log( data )
  data.intervalId = setInterval( () => loop(), 10000 / 60 )
}
function stop() {
  clearInterval( data.intervalId )
}
function loop() {
  logic()
  data.userLogic()
  requestAnimationFrame( () => draw() )
  requestAnimationFrame( () => data.userDraw() )
}
function logic() {
  if ( !data.level && data.levels.length ) {
    data.level = data.levels[ 0 ]
    const { tiles } = data.level

    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        if ( !Array.isArray( tiles[ y ][ x ] ) )
          tiles[ y ][ x ] = [ tiles[ y ][ x ] ]

        for ( let i = 0;  i < tiles[ y ][ x ].length;  i++ )
          tiles[ y ][ x ][ i ] = Sprite.sprites.get( tiles[ y ][ x ][ i ] )
      }
  }
}
function draw() {
  const { ctx, level, tileSize } = data

  if ( !level )
    return

  const { tiles } = level

  for ( let y = 0;  y < tiles.length;  y++ )
    for ( let x = 0;  x < tiles[ y ].length;  x++ )
      for ( let i = 0;  i < tiles[ y ][ x ].length;  i++ )
        tiles[ y ][ x ][ i ].drawframe( ctx, x * tileSize, y * tileSize, tileSize, tileSize )
}
function setup( { tileSize=data.tileSize } ) {
  data.tileSize = tileSize
}
/**
 * @param {Function} logicFunction
 */
function createAdditionalLogic( logicFunction ) {
  data.userLogic = logicFunction
}
/**
 * @param {Function} drawFunction
 */
function createAdditionalDraw( drawFunction ) {
  data.userDraw = drawFunction
}
/**
 * @param {String|Number} id Id of element, which will be connected with map
 * @param {Sprite} sprite
 */
function createSprite( id, { src, frames, framesInRow } ) {
  Sprite.sprites.set( id, new Sprite( { src, frames, framesInRow } ) )
}
/**
 * @param {Level|Level[]} level_s Instance(s) of Level class
 */
function createLevel( level_s ) {
  if ( !Array.isArray( level_s ) )
    level_s = [ level_s ]

  data.levels = [ ...data.levels, ...level_s ]
}

export {
  setup,
  start,
  stop,
  createAdditionalLogic,
  createAdditionalDraw,
  createSprite,
  Sprite,
  createLevel,
  Level,
}