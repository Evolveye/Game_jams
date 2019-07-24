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
   * @param {Object} param0
   * @param {Entity[][][]} param0.tiles
   * @param {Function} param0.script
   * @param {Function} param0.events
   */
  constructor( { tiles, script, events } ) {
    this.height = tiles.length
    this.width = 0

    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        if ( !Array.isArray( tiles[ y ][ x ] ) ) tiles[ y ][ x ] = [ tiles[ y ][ x ] ]
        if ( x > this.width ) this.width = x
      }

    this.tiles = tiles
    this.script = script
    this.events = events
    this.length = tiles.length
    this.runCounter = 0
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
}



export class SpriteInfo {
  constructor( type, { connectable=false, canBePlacedOn=[], classname=`Entity`, connectedDirs } ) {
    this.type = type
    this.connectable = connectable
    this.canBePlacedOn = canBePlacedOn
    this.classname = classname
    this.connectedDirs = connectedDirs
  }
}
export class Sprite {
  /**
   * @param {Object} param0
   * @param {String} param0.src Path without extension and without direction informations (__./img__ instead __./img-0010.png__)
   */
  constructor( id, { src, frames=1, framesInRow=1, connectable=false } ) {
    this.id = id
    this.type = id.match( /(?<type>[^-]+)(?:-\d+)?/ ).groups.type
    this.image = new Image()
    this.image.src = src
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
/** @type {Map<String,SpriteInfo>} */
Sprite.info = new Map



export class Entity {
  constructor( id, { tileX, tileY, tileL, sprite, rotateAngle=0 } ) {
    this.id = id
    this.sprite = sprite
    this.type = sprite.type
    this.rotateAngle = rotateAngle
    this.translateX = 0
    this.translateY = 0
    this.x = 1
    this.y = 1
    this.tileX = tileX
    this.tileY = tileY
    this.tileL = tileL
    this.speed = 1.5
    this.size = Game.config.tileSize * 1 //playerSize
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw( ctx, left, top, width, height ) {
    const { x, y, rotateAngle, translateX, translateY } = this
    const { image, frameWidth, frameHeight } = this.sprite
    const halfWidth = width / 2
    const halfHeight = height / 2

    // if ( this.type = `ib1` ) console.log( this )

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
    const { columns, rows, frames } = this.sprite
    this.x++

    if ( this.x > columns || (this.y - 1) * columns + this.x > frames ) {
      this.x = 1
      this.y++
    }
    if ( this.y > rows )
      this.y = 1
  }

  changeSprite( newSprite ) {
    this.id = newSprite.id
    this.sprite = newSprite
    this.type = newSprite.type
  }

  getIdConnectedWith( direction ) {
    /** @type {String} */
    let { myDirs } = this.id.match( /(?<myDirs>\d+)$/ ).groups

    switch ( direction ) {
      case `top`:    myDirs = `1${myDirs.slice( 1 )}`; break
      case `right`:  myDirs = `${myDirs.slice( 0, 1 )}1${myDirs.slice( 2 )}`; break
      case `bottom`: myDirs = `${myDirs.slice( 0, 2 )}1${myDirs.slice( 3 )}`; break
      case `left`:   myDirs = `${myDirs.slice( 0, 3 )}1`; break
    }

    console.log( this.id, `${this.type}-${myDirs}` )
    return `${this.type}-${myDirs}`
  }

  /**
   * @param {Entity[]} tile
   */
  canStandOn( tile ) {
    const { canBePlacedOn } = Sprite.info.get( this.type )

    if ( !tile.length ) return canBePlacedOn.includes( null )
    else return canBePlacedOn.includes( tile[ tile.length - 1 ].id )
  }

  onclick() {}
}
/** @type {Map<String,EntityInfo>} */
Entity.info = new Map

export class InventoryItem {
  constructor( id, count=0 ) {
    this.id = id
    this.count = count
  }
}
export class Player extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )

    /** @type {InventoryItem[]} */
    this.inventory = []
  }
}



export class Icon {
  /**
   * @param {String} src
   * @param {String[]} canBePlacedOn Array of images IDs
   */
  constructor( id, src ) {
    this.node = new Image
    this.node.src = src
    this.node.alt = `game-image`
    this.id = id
  }
}