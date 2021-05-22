import imageCar from "../images/car_black_1.png"


class Entity {
  sprite = new Image()
  #angle = Math.PI / 180


  constructor( x, y, width, height, imageObject, visible = true ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.sprite.src = imageObject
    this.visible = visible
  }


  get angle() {
    return this.#angle * 180 / Math.PI
  }
  get angleDegress() {
    return this.#angle
  }


  /** @param {CanvasRenderingContext2D} ctx */
  draw = ctx => {
    const { visible, sprite, x, y, width, height } = this

    if (!visible) return

    ctx.save()
    ctx.translate( x, y )
    ctx.rotate( this.#angle )
    ctx.drawImage( sprite, -width / 2, -height / 2, width, height )
    ctx.restore()
  }


  moveTo( x, y ) {
    this.x = x
    this.y = y
  }


  setAngle( angle ) {
    this.#angle = angle * Math.PI / 180
  }


  doTick() { /* for overriding */ }
}


class MovingEntity extends Entity {


  constructor( x, y, width, height, imageObject, visible, velocity = 0 ) {
    super( x, y, width, height, imageObject, visible )

    this.v = velocity
  }


  setVelocity( v ) {
    this.v = v
  }


  doTick() {
    const { x, y, v, angle, angleDegress } = this

    // if (y < 200 && angle != 90) this.setAngle( 90 )
    // if (x > 800 && angle != 180) this.setAngle( 180 )
    // if (y > 500 && angle != 270) this.setAngle( 270 )
    // if (x < 200 && angle != 0) this.setAngle( 0 )

    this.x += v * Math.sin( angleDegress )
    this.y -= v * Math.cos( angleDegress )
  }
}

export default class Player extends MovingEntity {
  constructor() {
    const size = 20

    super( 0, 0, size, size * 2, imageCar, false, 0.5 )
  }
}
