import * as GameEntitiesStorage from "./engine-entities.js"
import { storage as assetsStorage } from "./engine-assets.js"

const { Entity, ActiveEntity } = GameEntitiesStorage

export default class Level {
  /**
   * @param {object} param0
   * @param {Entity[][][]} param0.tiles
   * @param {function():Promise} param0.script
   * @param {function():void} param0.events
   * @param {number} param0.buildingSpeed Seconds to build level
   * @param {boolean} param0.flying Flying level type
   */
  constructor( { tiles, script, events, buildingSpeed, flying=false, gravity=false } ) {
    this.height = tiles.length
    this.width = 0
    this.flying = flying
    this.gravity = gravity
    /** @type {Entity[][][]} */
    this.tiles = tiles
    this.script = script
    this.events = events
    this.length = tiles.length
    this.runCounter = 0
    this.buildingSpeed = buildingSpeed

    const flyingLength = 9

    if ( flying && tiles.length <= flyingLength ) {
      for ( let i = tiles.length; i < flyingLength; i++) tiles.unshift( [] )
    }

    for ( let y = 0;  y < tiles.length;  y++ ) {
      if ( flying && tiles[ y ].length <= flyingLength ) {
        for ( let i = tiles[ y ].length; i < flyingLength; i++)
          if (i % 2 == 0) tiles[ y ].push( [] )
          else tiles[ y ].unshift( [] )
      }
      else if ( tiles[ y ].length == 0 ) tiles[ y ].push( [] )

      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        if ( !Array.isArray( tiles[ y ][ x ] ) ) tiles[ y ][ x ] = [ tiles[ y ][ x ] ]
        if ( x > this.width ) this.width = x

        for ( let l = 0;  l < tiles[ y ][ x ].length;  l++ ) {
          const entityData = tiles[ y ][ x ][ l ]

          if ( !entityData ) continue

          const { spriteId, rotateAngle } = entityData.match( /(?<spriteId>.*?)(?:-(?<rotateAngle>\d+))?$/ ).groups
          const tile = this.createTile( spriteId, x, y, l, rotateAngle )

          if ( !tile ) {
            console.warn( `Missing entity!   tileName: ${entityData} -> id: ${spriteId}` )
            continue
          }

          this.tiles[ y ][ x ][ l ] = tile
        }
      }
    }
  }

  /** Build level tile after the tile
   */
  async build() {
    const { tiles, buildingSpeed } = this
    const indices = []

    for ( const { x, y, l, entity } of this.everyEntity() )
      if ( typeof entity != `string` ) indices.push( { x, y } )

    this.tiles = Array.from( { length:tiles.length }, (_, i) => Array.from( { length:tiles[ i ].length }, () => [] ) )

    const timePerTile = buildingSpeed / indices.length
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

  /** Iterate by every entity in the layer
   * @param {number} layer
   */
  * everyEntityInLayerHigherThan( layer ) {
    for ( const data of this.every( layer + 1, Infinity ) )
      yield data
  }
  /** Iterate by every entity that isn't in the layer
   * @param {number} layer
   */
  * everyEntityInLayer( layer ) {
    for ( const data of this.every( layer, layer + 1 ) )
      yield data
  }
  /** Iterate by every entity which don't have ID from given IDs
   * @param {string[]} ids
   */
  * everyButNotIds( ...ids ) {
    for ( const data of this.every( 0, Infinity ) )
      if ( !ids.includes( data.entity.id ) ) yield data
  }
  /** Iterate by every entity with one of given IDs
   * @param {string[]} ids
   */
  * everyId( ...ids ) {
    for ( const data of this.every( 0, Infinity ) )
      if ( ids.includes( data.entity.id ) ) yield data
  }
  /** Iterate by every sterable entity
   */
  * everySterable() {
    for ( const data of this.every( 0, Infinity ) )
      if ( data.entity.sprite.info.sterable ) yield data
  }
  /** Iterate by every entity
   */
  * everyEntity() {
    for ( const data of this.every( 0, Infinity ) )
      yield data
  }
  /** Iterate by every action entity
   */
  * everyActionEntity() {
    for ( const data of this.every( 0, Infinity ) )
      if ( data.entity instanceof ActiveEntity ) yield data
  }
  /** Iterate by every entity from layers range
   * @param {number} layerMin
   * @param {number} layerMax
   */
  * every( layerMin, layerMax ) {
    const { tiles } = this

    for ( let y = 0;  y < tiles.length;  y++ )
      for ( let x = 0;  x < tiles[ y ].length;  x++ ) {
        const stop = layerMax == Infinity  ?  tiles[ y ][ x ].length  :  layerMax

        for ( let l = layerMin;  l < stop;  l++ )
          if ( tiles[ y ][ x ][ l ] ) yield { x, y, l, entity:tiles[ y ][ x ][ l ] }
      }
  }

  /** Get level row
   * @param {number} y
   */
  row( y ) {
    const { tiles } = this

    if ( y < 0 || tiles.length <= y ) return null
    return tiles[ y ]
  }
  /** Get level tile
   * @param {number} x
   * @param {number} y
   */
  get( x, y ) {
    const { tiles } = this


    if ( y < 0 || tiles.length <= y ) return null
    if ( x < 0 || tiles[ y ].length <= x ) return null

    return tiles[ y ][ x ]
  }
  /** Get entity on top of tile
   * @param {number} x
   * @param {number} y
   */
  getTop( x, y ) {
    const tile = this.get( x, y )

    return !tile ? null : tile[ tile.length - 1 ]
  }
  /** Move entity/entities from equal and higher layer of one tile to top another
   * @param {number} x
   * @param {number} y
   * @param {number} l
   * @param {number} newX
   * @param {number} newY
   */
  move( x, y, l, newX, newY ) {
    const newTile = this.get( newX, newY )

    if (!newTile) return false

    const entities = this.get( x, y ).splice( l )

    entities.forEach( (entity, i) => {
      entity.tileX = newX
      entity.tileY = newY
      entity.tileL = newTile.length + i
    } )

    this.tiles[ newY ][ newX ].push( ...entities )

    return true
  }
  /** Remove entity/entities from equal and higher layer
   * @param {number} x
   * @param {number} y
   * @param {number} l
   */
  remove( x, y, l ) {
    this.get( x, y ).splice( l )
  }
  /** Create tile
   * @param {string} id
   * @param {number} x
   * @param {number} y
   * @param {number} l
   * @param {number} rotateAngle
   */
  createTile( id, x, y, l, rotateAngle ) {
    const { sprites, spritesInfo } = assetsStorage
    const spriteInfo = spritesInfo.get( id )

    if ( !spriteInfo ) return null

    const dirs = spriteInfo.connectedDirs

    if ( spriteInfo.connectable ) {
      let dir = `-`

      const { group } = spriteInfo
      const dirstWithDot = spriteInfo.directionsWithDots
      const updateDir = num => (dir.length == 1) ? (dir += num) : (dir += (dirstWithDot ? `.${num}` : num))

      let left   = (this.get( x - 1, y + 0 ) || [])
      let right  = (this.get( x + 1, y + 0 ) || [])
      let top    = (this.get( x + 0, y - 1 ) || [])
      let bottom = (this.get( x + 0, y + 1 ) || [])

      left = typeof left == `string` ? null : (left.filter( tile => !!tile ).find( tile => tile.group == group ))
      right = typeof right == `string` ? null : (right.filter( tile => !!tile ).find( tile => tile.group == group ))
      top = typeof top == `string` ? null : (top.filter( tile => !!tile ).find( tile => tile.group == group ))
      bottom = typeof bottom == `string` ? null : (bottom.filter( tile => !!tile ).find( tile => tile.group == group ))

      if ( dirs.top || top ) {
        top && top.changeSprite( sprites.get( top.getIdConnectedWith( `bottom` ) ) )
        updateDir( 1 )
      }
      else updateDir( 0 )

      if ( dirs.right || right ) {
        right && right.changeSprite( sprites.get( right.getIdConnectedWith( `left` ) ) )
        updateDir( 1 )
      }
      else updateDir( 0 )

      if ( dirs.bottom || bottom ) {
        bottom && bottom.changeSprite( sprites.get( bottom.getIdConnectedWith( `top` ) ) )
        updateDir( 1 )
      }
      else updateDir( 0 )

      if ( dirs.left || left ) {
        left && left.changeSprite( sprites.get( left.getIdConnectedWith( `right` ) ) )
        updateDir( 1 )
      }
      else updateDir( 0 )

      id = id + dir
    }

    return new GameEntitiesStorage[ spriteInfo.classname ]( id, {
      tileX: x,
      tileY: y,
      tileL: l,
      sprite: sprites.get( id ),
      rotateAngle: +rotateAngle
    } )
  }
}