export default class Cell {
  constructor( x, y, falling=false ) {
    this.x = x
    this.y = y
    this.falling = falling
  }
}

export class SandCell extends Cell {
  type = `sand`
}