import Entity, { EntityConfig } from "./Entity"
import Inventory, { ThingInInventory } from "./Inventory"

export type MovingEntityConfig = EntityConfig & {}

export default class MovingEntity extends Entity {
  #inventory = new Inventory()
  speed = 0.2

  constructor( x:number, y:number, { labels, size, keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount }:MovingEntityConfig ) {
    super( x, y, { labels, size, keyBinds, spriteSrc, framesPerRow, framesPerColumn, framesCount } )
  }


  setSpeed = (newSpeed:number) => this.speed = newSpeed


  getInventory = () => this.#inventory.getData()
  addToInventory = (...things:ThingInInventory[]) => {
    this.#inventory.add( ...things )
  }
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
    this.x += Math.cos( this.angle ) * speed
    this.y -= Math.sin( this.angle ) * speed
  }


  tick = (tFrame:number):void => {
    tFrame
    throw new Error( `You should override method "tick"` )
  }
}
