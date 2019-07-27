export const storage = {
  /** @type {Map<String,SpriteInfo>} */
  spritesInfo: new Map,
  /** @type {Map<String,Sprite>} */
  sprites: new Map,
  /** @type {Map<String,Icon>} */
  icons: new Map
}

/** Object needed to initialize sprite asset
 * @typedef {object} SpriteInitializingData
 * @property {string[]} canBePlacedOn
 * @property {boolean} connectable
 * @property {object} connectedDirs
 * @property {boolean} connectedDirs.left
 * @property {boolean} connectedDirs.right
 * @property {boolean} connectedDirs.top
 * @property {boolean} connectedDirs.bottom
 * @property {string} classname
 * @property {number} framesInRow
 * @property {number} frames
 */

/** Create entity
 * @param {string} src
 * @param {SpriteInitializingData} spriteData
 */
export function createEntity( src, spriteData={} ) {
  if ( !spriteData.src ) spriteData.src = src

  const { id, group } = spriteData.src.match( /(?<id>(?<group>[^\n /]*?)(?:-\d+)?)\.\w+/ ).groups
  const { spritesInfo, sprites, icons } = storage

  if ( !spritesInfo.has( group ) ) spritesInfo.set( group, new SpriteInfo( group, spriteData ) )

  icons.set( group, new Icon( group, src ) )
  sprites.set( id, new Sprite( id, spriteData ) )
}

export class Icon {
  /**
   * @param {string} linkedSpriteGroup
   * @param {string} src
   */
  constructor( linkedSpriteGroup, src ) {
    this.node = new Image
    this.node.src = src
    this.node.alt = `game-image`
    this.linkedSpriteGroup = linkedSpriteGroup
  }
}
export class SpriteInfo {
  /**
   * @param {string} type
   * @param {SpriteInitializingData} param1
   */
  constructor( spriteGroup, { connectable=false, canBePlacedOn=[], classname=`Entity`, connectedDirs={} } ) {
    this.group = spriteGroup
    this.connectable = connectable
    this.canBePlacedOn = canBePlacedOn
    this.classname = classname
    this.connectedDirs = connectedDirs
  }
}
export class Sprite {
  /**
   * @param {string} id
   * @param {SpriteInitializingData} param1
   */
  constructor( id, { src, frames=1, framesInRow=1 } ) {
    this.id = id
    this.info = storage.spritesInfo.get( id.match( /(?<group>[^-]+)(?:-\d+)?/ ).groups.group )
    this.image = new Image
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