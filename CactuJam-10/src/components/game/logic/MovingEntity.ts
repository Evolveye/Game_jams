import Entity, { EntityConfig } from "./Entity"
import Inventory, { ThingInInventory } from "./Inventory"
import { Void } from "./LevelCell"

export enum ObstacleType { WALL, AIR }
export type Obstacle = { type:ObstacleType, tileType:(typeof Entity)}
export type MovingEntityConfig = EntityConfig & {
  cantMoveOn?: (typeof Entity | Obstacle)[]
}

export default class MovingEntity extends Entity {
  #inventory = new Inventory()
  speed = 0.2
  cantMoveOn:Obstacle[] = [ { type:ObstacleType.WALL, tileType:Void } ]

  constructor( x:number, y:number, { cantMoveOn = [], labels, size, keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount }:MovingEntityConfig ) {
    super( x, y, { labels, size, keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount } )

    const standarizedCanMoveOn = cantMoveOn.map( o => `type` in o && `tileType` in o ? o : { type:ObstacleType.WALL, tileType:o } )
    this.cantMoveOn.push( ...standarizedCanMoveOn )
  }


  setSpeed = (newSpeed:number) => this.speed = newSpeed


  getInventory = () => this.#inventory.getData()
  addToInventory = (...things:ThingInInventory[]) => {
    this.#inventory.add( ...things )
  }
  removeFromInventory = (name:string, count = 1) => this.#inventory.remove( name, count )
  takeFromWorld = () => {
    const pos = this.getTilePos()
    return this.getWorld()?.takeFromTop( pos.x, pos.y )
  }


  goUp = (speed = this.speed) => {
    this.setAngle( 90 )
    this.go( speed )
  }
  goDown = (speed = this.speed) => {
    this.setAngle( 270 )
    this.go( speed )
  }
  goRight = (speed = this.speed) => {
    this.setAngle( 0 )
    this.go( speed )
  }
  goLeft = (speed = this.speed) => {
    this.setAngle( 180 )
    this.go( speed )
  }
  go = (speed = this.speed) => {
    const coords = this.getTilePos()
    const nextX = this.x + Math.cos( this.angle ) * speed
    const nextY = this.y - Math.sin( this.angle ) * speed
    const signX = Math.sign( nextX - this.x )
    const signY = Math.sign( nextY - this.y )
    const nextCoords = this.getTilePos( nextX, nextY )
    const world = this.getWorld()

    const getCellSizes = (x, y) => world.getCell( x, y ).top()
    const tilesToCheck = [ getCellSizes( nextCoords.x, nextCoords.y ) ]

    if (nextX != this.x) {
      tilesToCheck.push(
        getCellSizes( coords.x + signX, coords.y - 1 ),
        getCellSizes( coords.x + signX, coords.y + 0 ),
        getCellSizes( coords.x + signX, coords.y + 1 ),
      )
    }
    if (nextY != this.y) {
      tilesToCheck.push(
        getCellSizes( coords.x - 1, coords.y + signY ),
        getCellSizes( coords.x + 0, coords.y + signY ),
        getCellSizes( coords.x + 1, coords.y + signY ),
      )
    }

    const collision = tilesToCheck.some( t => {
      const obstacle = this.cantMoveOn.find( o => t instanceof o.tileType )

      if (!obstacle) return false

      switch (obstacle.type) {
        case ObstacleType.AIR: return nextCoords.x === t.x && nextCoords.y === t.y
        case ObstacleType.WALL: return MovingEntity.checkCollisionAABB( { x:nextX, y:nextY, w:this.w * 0.9, h:this.h * 0.9 }, t )
      }
    } )

    if (collision) return

    this.x = nextX
    this.y = nextY
  }


  tick = (tFrame:number):void => {
    tFrame
    throw new Error( `You should override method "tick"` )
  }


  static checkCollisionAABB( a:{x:number, y:number, w:number, h:number}, b:{x:number, y:number, w:number, h:number} ) {
    const aMinX = a.x - a.w / 2
    const aMinY = a.y - a.h / 2

    const bMinX = b.x - b.w / 2
    const bMinH = b.y - b.h / 2

    return true
      &&  aMinX < bMinX + b.w && aMinX + a.w > bMinX
      &&  aMinY < bMinH + b.h && aMinY + a.h > bMinH
  }
}
