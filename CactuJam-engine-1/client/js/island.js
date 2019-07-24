import { Entity, Level } from "./engine-classes.js"

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