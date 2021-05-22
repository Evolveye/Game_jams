import imageCar from "../images/car_black_1.png"


class Entity {
  sprite = new Image()


  constructor( x, y, width, height, imageObject, visible = true ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.sprite.src = imageObject
    this.visible = visible
  }


  /** @param {CanvasRenderingContext2D} */
  draw = ctx => {
    const { visible, sprite, x, y, width, height } = this

    if (visible) ctx.drawImage( sprite, x - width / 2, y - height / 2, width, height )
  }
}


class MovingEntity extends Entity {
  constructor( x, y, width, height, imageObject, velocity = 0, visible = true ) {
    super( x, y, width, height, imageObject, false )

    this.v = velocity
  }
}

export default class Player extends Entity {
  constructor() {
    const size = 20

    super( 0, 0, size, size * 2, imageCar, false )
  }
}
