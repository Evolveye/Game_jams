document.body.innerHTML = /* html */ `
  <canvas>
`

const data = {
  ctx: document.body.querySelector( `canvas` ).getContext( `2d` ),
  intervalId: null,
  tileSize: 50,
  nextFrameTicks: 5,
  nextFrameCache: 0,
  /** @type {GameElement} */
  player: null,
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
  /**
   *
   * @param {Object} param0
   * @param {GameElement[][][]} param0.tiles
   */
  constructor( { tiles, script } ) {
    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ )
        if ( !Array.isArray( tiles[ y ][ x ] ) )
          tiles[ y ][ x ] = [ tiles[ y ][ x ] ]

    this.tiles = tiles
    this.script = script
    this.length = tiles.length
  }

  * everyElementInLayerHigherThan( layer ) {
    for ( const data of this.every( layer + 1, Infinity ) )
      yield data
  }

  * everyElementInLayer( layer ) {
    for ( const data of this.every( layer, layer + 1 ) )
      yield data
  }

  * everyElement() {
    for ( const data of this.every( 0, Infinity ) )
      yield data
  }

  * every( layerMin, layerMax ) {
    const { tiles } = this

    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        const stop = layerMax == Infinity  ?  tiles[ y ][ x ].length  :  layerMax

        for ( let l = layerMin;  l < stop;  l++ )
          if ( tiles[ y ][ x ][ l ] ) yield { x, y, l, element:tiles[ y ][ x ][ l ] }
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
}
class Sprite {
  /**
   * @param {Object} param0
   * @param {String} param0.src Path without extension and without direction informations (__./img__ instead __./img-0010.png__)
   */
  constructor( { type, src, frames, framesInRow, connectable } ) {
    this.image = new Image()
    this.image.src = src
    this.type = type
    this.connectable = connectable
    this.frames = frames
    this.columns = framesInRow
    this.rows = Math.ceil( frames / framesInRow )
    this.frameWidth = 0
    this.frameHeight = 0

    this.image.onload = () => {
      this.frameWidth = this.image.width / framesInRow
      this.frameHeight = this.image.height / this.rows
    }
  }
}
Sprite.info = new Map
Sprite.sprites = new Map

class GameElement {
  constructor( { sprite, rotateAngle=0 } ) {
    this.sprite = sprite
    this.type = sprite.type
    this.rotateAngle = rotateAngle
    this.translateX = 0
    this.translateY = 0
    this.x = 1
    this.y = 1
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw( ctx, left, top, width, height ) {
    const { x, y, rotateAngle, translateX, translateY } = this
    const { image, frameWidth, frameHeight } = this.sprite
    const halfWidth = width / 2
    const halfHeight = height / 2

    ctx.save()
    ctx.translate( left + halfWidth + translateX, top + halfHeight + translateY )
    ctx.rotate( Math.PI / 180 * rotateAngle )
    ctx.drawImage( image,
      (x - 1) * frameWidth, (y - 1) * frameHeight, frameWidth, frameHeight,
      -halfWidth, -halfHeight, width, height
    )
    ctx.restore()
  }

  nextFrame() {
    const { columns, rows } = this.sprite
    this.x++

    if ( this.x > columns ) {
      this.x = 1
      this.y++
    }
    if ( this.y > rows )
      this.y = 1
  }
}

function start() {
  data.intervalId = setInterval( () => loop(), 1000 / 60 )
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
    const { level } = data

    for ( const { x, y, l, element } of level.everyElement() ) {
      let { spriteId, rotateAngle } = element.match( /(?<spriteId>[^-]+)(?:-(?<rotateAngle>[^-]+))?/ ).groups
      const elementInfo = Sprite.info.get( spriteId )

      if ( elementInfo.connectable ) {
        let dir = `-`

        const left   = ((level.get( x - 1, y + 0 ) || [])[ l ] || {}).type
        const right  = (level.get( x + 1, y + 0 ) || [])[ l ]
        const top    = ((level.get( x + 0, y - 1 ) || [])[ l ] || {}).type
        const bottom = (level.get( x + 0, y + 1 ) || [])[ l ]

        if ( top == spriteId ) dir += 1
        else dir += 0

        if ( right == spriteId ) dir += 1
        else dir += 0

        if ( bottom == spriteId ) dir += 1
        else dir += 0

        if ( left == spriteId ) dir += 1
        else dir += 0

        spriteId += dir
      }

      level.tiles[ y ][ x ][ l ] = new GameElement( {
        sprite: Sprite.sprites.get( spriteId ),
        rotateAngle: +rotateAngle
      } )

      if ( spriteId == `p` ) data.player = level.tiles[ y ][ x ][ l ]
    }
  }

  const { level, nextFrameCache, nextFrameTicks } = data

  data.player.translateX += .1

  // Sprites animating
  if ( nextFrameCache == nextFrameTicks ) {
    data.nextFrameCache = 0

    for ( const { element } of level.everyElement() )
      element.nextFrame()
  }
  else data.nextFrameCache++
}
function draw() {
  const { ctx, level, tileSize } = data

  if ( !level ) return

  for ( const { x, y, element } of level.everyElementInLayer( 0 ) )
    element.draw( ctx, x * tileSize, y * tileSize, tileSize, tileSize )

  for ( const { x, y, element } of level.everyElementInLayerHigherThan( 0 ) )
    element.draw( ctx, x * tileSize, y * tileSize, tileSize, tileSize )
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
 * @param {Object} param0
 * @param {String} param0.type
 * @param {String} param0.src
 * @param {Number} param0.frames
 * @param {Number} param0.framesInRow
 * @param {Boolean} param0.connectable
 */
function createSprite( type, src, { frames=1, framesInRow=1, connectable=false }={} ) {
  if ( !Sprite.info.has( type ) ) Sprite.info.set( type, {
    frames,
    framesInRow,
    connectable
  } )

  const info = Sprite.info.get( type )
  const id = type + (info.connectable  ?  `-${src.match( /.*?(\d+).\w+/ )[ 1 ]}`  :  ``)

  Sprite.sprites.set( id, new Sprite( {
    type,
    src,
    frames: info.frames,
    framesInRow: info.framesInRow,
    connectable: info.connectable
  } ) )
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