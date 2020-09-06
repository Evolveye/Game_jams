export default class Spider {
  canShoot = true
  shooting = false
  score = 0

  constructor( x, y ) {
    this.x = x
    this.y = y
  }
}
export class Housefly {
  hp = 1

  constructor( x, y, size ) {
    this.x = x
    this.y = y
    this.size = size
  }
}