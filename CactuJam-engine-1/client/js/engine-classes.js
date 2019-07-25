
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

  onclick() {}
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


class IslandEntity extends Entity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }
}

export class Land extends IslandEntity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }

  evolve( level, sprites, createTile ) {
    const { tileX:x, tileY:y } = this

    if ( level.get( x, y )[ this.tileL - 1 ].id != `c` ) return

    switch ( this.id ) {
      case `ib1-1000`: {
        this.changeSprite( sprites.get( `ib2.0` ) )
      } break
      case `ib2.0`: {
        this.changeSprite( sprites.get( `ib2.1` ) )
      } break
      case `ib2.1`: {
        this.changeSprite( sprites.get( `ib2.2` ) )
      } break
      case `ib2.2`: {
        if ( level.getTop( x, y ).type != `iAnimal` ) this.changeSprite( sprites.get( `ib2.3` ) )
        else {
          level.remove( x, y, this.tileL + 1 )
          this.changeSprite( sprites.get( `ib3.0` ) )
          const tile = level.get( x, y )
          tile.push( createTile( `iPlague`, x, y, tile.length, 0 ) )
        }
      } break
    }
  }
}

export class Cactus extends IslandEntity {
  constructor( spriteId, data ) {
    super( spriteId, data )

    /** @type {{ x:Number y:Number land:Entity[]}[]} */
    this.linkedLands = []
    /** @type {Number} */
    this.clicks = 0
  }

  /**
   * @param {Level} level
   */
  evolve( level, sprites, createTile ) {
    if ( level.getTop( this.tileX, this.tileY ).id != this.id ) return

    switch ( this.id ) {
      case `c`: {
        const { tileX, tileY } = this
        const lands = {
          left:   level.getTop( tileX - 1, tileY ),
          right:  level.getTop( tileX + 1, tileY ),
          top:    level.getTop( tileX, tileY - 1 ),
          bottom: level.getTop( tileX, tileY + 1 )
        }

        if ( lands.left.type == `ib1` ) {
          this.linkedLands = [ { x:(tileX - 1), y:tileY } ]
          this.changeSprite( sprites.get( `cbl.0001` ) )
        }
        else if ( lands.right.type == `ib1` ) {
          this.linkedLands = [ { x:(tileX + 1), y:tileY } ]
          this.changeSprite( sprites.get( `cbl.0100` ) )
        }
        else if ( lands.top.type == `ib1` ) {
          this.linkedLands = [ { x:tileX, y:(tileY - 1) } ]
          this.changeSprite( sprites.get( `cbl.1000` ) )
        }
        else if ( lands.bottom.type == `ib1` ) {
          this.linkedLands = [ { x:tileX, y:(tileY + 1) } ]
          this.changeSprite( sprites.get( `cbl.0010` ) )
        }
        else {
          this.changeSprite( sprites.get( `cbl.0000` ) )
        }
      } break
      case `cBaby`: {
        this.changeSprite( sprites.get( `c` ) )
      } break
      case `cp.l`:
      case `cp.r`:
      case `cp.t`:
      case `cp.b`: {
        this.changeSprite( sprites.get( `cBaby` ) )
      } break
      case `cbl.0000`:
      case `cbl.1000`:
      case `cbl.0100`:
      case `cbl.0010`:
      case `cbl.0001`: {
        this.changeSprite( sprites.get( `cBig` ) )
        this.linkedLands.forEach( ({ x, y, land }) => {
          const tile = level.get( x, y )
          tile.push( createTile( `if`, x, y, tile.length, 0 ) )
        } )
      }
    }
  }
  onclick( level, sprites, createTile ) {
    if ( this.clicks != 10 ) this.clicks++
    else {
      const { tileX:x, tileY:y } = this
      const left   = level.get( x - 1, y )
      const right  = level.get( x + 1, y )
      const top    = level.get( x, y - 1 )
      const bottom = level.get( x, y + 1 )

      left.push(   createTile( `cp.l`, x - 1, y, left.length,   0 ) )
      right.push(  createTile( `cp.r`, x + 1, y, right.length,  0 ) )
      top.push(    createTile( `cp.t`, x, y - 1, top.length,    0 ) )
      bottom.push( createTile( `cp.b`, x, y + 1, bottom.length, 0 ) )

      level.remove( x, y, this.tileL )
    }
  }
}

export class MagicFlower extends IslandEntity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }
}

export class Animal extends IslandEntity {
  constructor( spriteId, data ) {
    super( spriteId, data )

    this.translateY += -20
  }

  onclick( level, sprites, createTile, inventory ) {
    level.remove( this.tileX, this.tileY, this.tileL )
    inventory( `add`, `iAnimal`, 1 )
  }
}

export class Plague extends IslandEntity {
  constructor( spriteId, data ) {
    super( spriteId, data )
  }

  onclick( level, sprites, createTile, inventory ) {
    level.remove( this.tileX, this.tileY, this.tileL )
    inventory( `add`, `iPlague`, 1 )
  }
}