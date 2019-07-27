import { Sprite } from "./engine-assets.js"
import Game from "./engine.js"

export class InventoryItem {
  /**
   * @param {string} itemGroup
   * @param {number} count
   */
  constructor( itemGroup, count=0 ) {
    this.group = itemGroup
    this.count = count
  }
}

export class Entity {
  /**
   * @param {string} id
   * @param {object} param1
   * @param {number} param1.tileX
   * @param {number} param1.tileY
   * @param {number} param1.tileL
   * @param {Sprite} param1.sprite
   * @param {number} param1.rotateAngle
   */
  constructor( id, { tileX, tileY, tileL, sprite, rotateAngle=0 } ) {
    this.id = id
    this.sprite = sprite
    this.group = sprite.info.group
    this.rotateAngle = rotateAngle
    this.translateX = 0
    this.translateY = 0
    this.x = 1
    this.y = 1
    this.tileX = tileX
    this.tileY = tileY
    this.tileL = tileL
    this.speed = 1.5
  }

  /** Draw entity on canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} left
   * @param {number} top
   * @param {number} width
   * @param {number} height
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

  /** Set next frame
   */
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

  /** Change sprite
   * @param {Sprite} newSprite
   */
  changeSprite( newSprite ) {
    this.id = newSprite.id
    this.sprite = newSprite
    this.group = newSprite.info.group
  }

  /** Get ID of connected tile on one of directon
   * @param {"left"|"right"|"top"|"bottom"} direction
   */
  getIdConnectedWith( direction ) {
    /** @type {String} */
    let { myDirs } = this.id.match( /(?<myDirs>\d+)$/ ).groups

    switch ( direction ) {
      case `top`:    myDirs = `1${myDirs.slice( 1 )}`; break
      case `right`:  myDirs = `${myDirs.slice( 0, 1 )}1${myDirs.slice( 2 )}`; break
      case `bottom`: myDirs = `${myDirs.slice( 0, 2 )}1${myDirs.slice( 3 )}`; break
      case `left`:   myDirs = `${myDirs.slice( 0, 3 )}1`; break
    }

    return `${this.group}-${myDirs}`
  }

  /** Code to execute when tile will be clicked
   */
  onclick() {}
}
export class Player extends Entity {
  /**
   * @param {string} spriteId
   * @param {object} data
   * @param {number} data.tileX
   * @param {number} data.tileY
   * @param {number} data.tileL
   * @param {Sprite} data.sprite
   * @param {number} data.rotateAngle
   */
  constructor( spriteId, data ) {
    super( spriteId, data )

    /** @type {InventoryItem[]} */
    this.inventory = []
  }
}



/* *
 * Additional classes below
 */


export class Land extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }

  /**
   * @param {Game} game
   */
  evolve( game ) {
    const { level } = game
    const { sprites } = game.storage
    const { tileX:x, tileY:y } = this

    if ( level.get( x, y )[ this.tileL - 1 ].id != `cactus` ) return

    switch ( this.id ) {
      case `land-1000`: {
        this.changeSprite( sprites.get( `land-cactus-0` ) )
      } break
      case `land-cactus-0`: {
        this.changeSprite( sprites.get( `land-cactus-1` ) )
      } break
      case `land-cactus-1`: {
        this.changeSprite( sprites.get( `land-cactus-2` ) )
      } break
      case `land-cactus-2`: {
        if ( level.getTop( x, y ).group != `animal` ) this.changeSprite( sprites.get( `land-cactus-3` ) )
        else {
          level.remove( x, y, this.tileL + 1 )
          this.changeSprite( sprites.get( `land-plague` ) )
          const tile = level.get( x, y )
          tile.push( createTile( `plague`, x, y, tile.length, 0 ) )
        }
      } break
    }
  }
}

export class Cactus extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )

    /** @type {{ x:Number y:Number land:Entity[]}[]} */
    this.linkedLands = []
    /** @type {Number} */
    this.clicks = 0
  }

  /**
   * @param {Game} game
   */
  evolve( game ) {
    const { level } = game
    const { sprites } = game.storage

    if ( level.getTop( this.tileX, this.tileY ).id != this.id ) return

    switch ( this.id ) {
      case `cactus`: {
        const { tileX, tileY } = this
        const { level } = game
        const validForFlower = tile => tile.group == `land` && !/cactus/.test( tile.id )
        const lands = {
          left:   level.getTop( tileX - 1, tileY ),
          right:  level.getTop( tileX + 1, tileY ),
          top:    level.getTop( tileX, tileY - 1 ),
          bottom: level.getTop( tileX, tileY + 1 )
        }

        if ( validForFlower( lands.left ) ) {
          this.linkedLands = [ { x:(tileX - 1), y:tileY } ]
          this.changeSprite( sprites.get( `cactus-bloomed-0001` ) )
        }
        else if ( validForFlower( lands.right ) ) {
          this.linkedLands = [ { x:(tileX + 1), y:tileY } ]
          this.changeSprite( sprites.get( `cactus-bloomed-0100` ) )
        }
        else if ( validForFlower( lands.top ) ) {
          this.linkedLands = [ { x:tileX, y:(tileY - 1) } ]
          this.changeSprite( sprites.get( `cactus-bloomed-1000` ) )
        }
        else if ( validForFlower( lands.bottom.group ) ) {
          this.linkedLands = [ { x:tileX, y:(tileY + 1) } ]
          this.changeSprite( sprites.get( `cactus-bloomed-0010` ) )
        }
        else {
          this.changeSprite( sprites.get( `cactus-bloomed-0000` ) )
        }
      } break
      case `cactus-part-left`:
      case `cactus-part-right`:
      case `cactus-part-top`:
      case `cactus-part-bottom`: {
        this.changeSprite( sprites.get( `cactus-baby` ) )
      } break
      case `cactus-baby`: {
        this.changeSprite( sprites.get( `cactus` ) )
      } break
      case `cactus-bloomed-0000`:
      case `cactus-bloomed-1000`:
      case `cactus-bloomed-0100`:
      case `cactus-bloomed-0010`:
      case `cactus-bloomed-0001`: {
        this.changeSprite( sprites.get( `cactus-big` ) )
        this.linkedLands.forEach( ({ x, y }) => {
          const tile = level.get( x, y )
          tile.push( level.createTile( `flower`, x, y, tile.length, 0 ) )
        } )
      }
    }
  }
  /**
   * @param {Game} game
   */
  onclick( game ) {
    if ( this.clicks != 10 ) this.clicks++
    else {
      const { tileX:x, tileY:y } = this
      const { level } = game

      const left   = level.get( x - 1, y )
      const right  = level.get( x + 1, y )
      const top    = level.get( x, y - 1 )
      const bottom = level.get( x, y + 1 )

      level.getTop( x - 1, y ).id == `water` && left.push(   level.createTile( `cactus-part-left`,   x - 1, y, left.length,   0 ) )
      level.getTop( x + 1, y ).id == `water` && right.push(  level.createTile( `cactus-part-right`,  x + 1, y, right.length,  0 ) )
      level.getTop( x, y - 1 ).id == `water` && top.push(    level.createTile( `cactus-part-top`,    x, y - 1, top.length,    0 ) )
      level.getTop( x, y + 1 ).id == `water` && bottom.push( level.createTile( `cactus-part-bottom`, x, y + 1, bottom.length, 0 ) )

      level.remove( x, y, this.tileL )
    }
  }
}

export class MagicFlower extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }

  /**
   * @param {Game} game
   */
  onclick( game ) {
    const { level } = game

    level.remove( this.tileX, this.tileY, this.tileL )
    game.inventory( `add`, `flower`, 1 )
  }
}

export class Animal extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )

    this.translateY += -20
  }

  /**
   * @param {Game} game
   */
  onclick( game ) {
    const { level } = game

    level.remove( this.tileX, this.tileY, this.tileL )
    game.inventory( `add`, `animal`, 1 )
  }
}

export class Plague extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }

  /**
   * @param {Game} game
   */
  onclick( game ) {
    const { level } = game

    level.remove( this.tileX, this.tileY, this.tileL )
    game.inventory( `add`, `plague`, 1 )
  }
}