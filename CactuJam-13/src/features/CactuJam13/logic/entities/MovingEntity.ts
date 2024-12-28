import Entity from "./Entity"

export type MovingEntityUpdateData = {
  surroundingSolids?: Entity[]
}

export default class MovingEntity extends Entity {
  gravityInfluencing = false
  velocity = { x:0, y:0 }
  #gravity = 10

  update( { surroundingSolids = [] }:MovingEntityUpdateData = {} ) {
    if (!this.gravityInfluencing && this.velocity.x === 0 && this.velocity.y === 0) return


    if (this.gravityInfluencing) {
      if (this.velocity.y < 0) this.velocity.y += this.#gravity
      else this.velocity.y += this.#gravity * 2
    }

    let collision = false
    for (const solid of surroundingSolids) {
      collision = (
        this.y + this.h * this.sizeMultiplier / 2 + this.velocity.y > solid.y - solid.h * solid.sizeMultiplier / 2
        // this.x + this.w * this.sizeMultiplier / 2 >= solid.x && this.x < solid.x + solid.w * solid.sizeMultiplier
      )

      if (!collision) continue

      this.y = solid.y - solid.h * solid.sizeMultiplier / 2 - this.h * this.sizeMultiplier / 2
      this.velocity.y = 0
      this.gravityInfluencing = false

      break
    }

    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}
