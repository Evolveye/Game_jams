import imageCar from "../images/car_black_1.png"
import imageRock from "../images/rock1.png"

class Hitbox {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor( x, y, width, height ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
}

export class Entity {
  /** @type {Hitbox[]} */
  hitboxes = []
  sprite = new Image()
  #angle = Math.PI / 180


  constructor( x, y, width, height, imageObject, visible = true ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.sprite.src = imageObject
    this.visible = visible

    this.hitboxes.push( new Hitbox( -width / 2, -height / 2, width, height ) )
  }


  get angle() {
    return this.#angle * 180 / Math.PI
  }
  get angleDegress() {
    return this.#angle
  }


  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} hitboxes
   */
  draw = (ctx, drawHitboxes = false) => {
    const { hitboxes, visible, sprite, x, y, width, height } = this

    if (!ctx || !visible) return

    ctx.strokeStyle = `red`
    ctx.beginPath()
    ctx.save()
    ctx.translate( x, y )
    if (drawHitboxes) hitboxes.forEach( hb => ctx.rect( hb.x, hb.y, hb.width, hb.height ) )
    ctx.stroke()
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


  /** @param {Entity} entity */
  isCollision( entity ) {
    if (!entity) return

    const getMinX = (entity, hitbox) => entity.x + hitbox.x
    const getMaxX = (entity, hitbox) => entity.x + hitbox.x + hitbox.width

    const getMinY = (entity, hitbox) => entity.y + hitbox.y
    const getMaxY = (entity, hitbox) => entity.y + hitbox.y + hitbox.height

    for (const thisHb of this.hitboxes) {
      for (const entityHb of entity.hitboxes) {
        const intersecting = true
          && (getMinX( this, thisHb ) <= getMaxX( entity, entityHb ) && getMaxX( this, thisHb ) >= getMinX( entity, entityHb ))
          && (getMinY( this, thisHb ) <= getMaxY( entity, entityHb ) && getMaxY( this, thisHb ) >= getMinY( entity, entityHb ))

        if (intersecting) return true
      }
    }

    return false
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

export class Player extends MovingEntity {
  constructor() {
    const size = 20

    super( 0, 0, size, size * 2, imageCar, false, 0 )

    this.hitboxes.splice( 0 )
    this.hitboxes.push(
      new Hitbox( -size / 2, -size, size, size ),
      new Hitbox( -size / 2, 0,     size, size ),
    )
  }
}


export class Rock extends Entity {
  constructor( x, y ) {
    const multiplier = 89 / 72
    const size = 20

    super( x, y, size * multiplier, size, imageRock )
  }
}
