import Entity from "./Entity"

export type MovingEntityUpdateData = {
  surroundingSolids?: Entity[]
}

export default class MovingEntity extends Entity {
  groundedOn: boolean | Entity = true
  velocity = { x:0, y:0 }
  #gravity = 1.5

  update( gameSpeedMultiplier:number, { surroundingSolids = [] }:MovingEntityUpdateData = {} ) {
    if (this.groundedOn && this.velocity.x === 0 && this.velocity.y === 0) return

    if (!this.groundedOn) {
      const gravity = this.#gravity * gameSpeedMultiplier

      if (this.velocity.y < 0) this.velocity.y += gravity
      else this.velocity.y += gravity * 2
    }

    const beforeMove = { x:this.x, y:this.y }
    const velocity = {
      x: this.velocity.x * gameSpeedMultiplier,
      y: this.velocity.y * gameSpeedMultiplier,
    }

    this.x += velocity.x
    this.y += velocity.y

    for (const solid of surroundingSolids) {
      const leftDist = (beforeMove.x - this.halfWidth) - (solid.x + solid.halfWidth)
      const rightDist = (solid.x - solid.halfWidth) - (beforeMove.x + this.halfWidth)
      const topDist = (beforeMove.y - this.halfHeight) - (solid.y + solid.halfHeight)
      const bottomDist = (solid.y - solid.halfHeight) - (beforeMove.y + this.halfHeight)

      const onTheSolidLeft = leftDist < 0 && rightDist >= 0
      const onTheSolidRight = leftDist >= 0 && rightDist < 0

      const onTheSolidTop = topDist < 0 && bottomDist >= 0
      const onTheSolidBottom = topDist >= 0 && bottomDist < 0

      if (this.groundedOn === solid && onTheSolidLeft !== onTheSolidRight) this.groundedOn = false

      if (velocity.x < 0 && onTheSolidLeft) continue
      else if (velocity.x > 0 && onTheSolidRight) continue

      if (velocity.y < 0 && (onTheSolidTop)) continue
      else if (velocity.y > 0 && onTheSolidBottom) continue

      const yCheckPassed = onTheSolidLeft || onTheSolidRight || velocity.y === 0 ? false : velocity.y < 0
        ? topDist + velocity.y >= 0
        : onTheSolidTop && bottomDist - velocity.y <= 0

      const xCheckPassed = onTheSolidTop || onTheSolidBottom || velocity.x === 0 ? false : velocity.x < 0
        ? onTheSolidRight && leftDist + velocity.x <= 0
        : onTheSolidLeft && rightDist - velocity.x <= 0

      if (velocity.y !== 0 && yCheckPassed) {
        if (velocity.y > 0) {
          this.y = solid.y - solid.halfHeight - this.halfHeight
          this.velocity.y = 0
          this.groundedOn = solid
        }
      }

      if (this.velocity.x !== 0 && xCheckPassed && solid.labels.includes( `wall` )) {
        this.x = solid.x - Math.sign( velocity.x ) * (solid.halfWidth + this.halfWidth)
        if (Math.abs( velocity.x ) > 10) {
          this.velocity.x *= -0.75
          this.velocity.y *= 1.1
        } else {
          this.velocity.x = 0
        }
      }

      if (this.velocity.x === 0 && this.velocity.y === 0) break
    }
  }
}
