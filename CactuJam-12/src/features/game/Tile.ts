export default class Tile {
  color: string
  movable = false

  constructor( color:string, movable:boolean = false ) {
    this.color = color
    this.movable = movable
  }
}
