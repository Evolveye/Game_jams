export default class Spider {
  canShoot = true
  shooting = false
  kills = 0

  constructor( x, y ) {
    this.x = x
    this.y = y
  }
}
export class Housefly {
  constructor( x, y, { score=10, size=1, speed=1, hp=1 }={} ) {
    this.x = x
    this.y = y
    this.size = size
    this.speedMultiplier = speed
    this.hp = hp
    this.score = score
  }
}