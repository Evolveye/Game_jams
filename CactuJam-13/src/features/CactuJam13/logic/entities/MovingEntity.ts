import Entity from "./Entity"

export type CollisionChecks = { left:boolean, right:boolean, top:boolean, bottom:boolean }
export type CollisionData = {
  entity: Entity
  velocity: { x:number, y:number }
}
export type CollisionReaction = (data:CollisionData, collisionChecks:CollisionChecks) => void | string

export type MovingEntityUpdateData = {
  surroundingSolids?: Entity[]
  reactions?: Record<string, CollisionReaction>
}

export default class MovingEntity extends Entity {
  groundedOn: boolean | Entity = true
  velocity = { x:0, y:0 }
  gravity = 1.5

  processStopTop( { entity }:CollisionData, { bottom }:CollisionChecks ) {
    if (!bottom) return

    // if (this.constructor.name === `MayEntity`) console.log( entity.y - entity.halfHeight - this.halfHeight )
    this.y = entity.y - entity.halfHeight - this.halfHeight
    this.velocity.y = 0
    this.groundedOn = entity
  }

  processStop( { entity, velocity }:CollisionData, { left, right }:CollisionChecks ) {
    if (this.velocity.x === 0 || !(left || right)) return

    this.x = entity.x - Math.sign( velocity.x ) * (entity.halfWidth + this.halfWidth)
    if (Math.abs( velocity.x ) > 10) {
      this.velocity.x *= -0.75
      this.velocity.y *= 1.1
    } else {
      this.velocity.x = 0
    }
  }

  update( gameSpeedMultiplier:number, { surroundingSolids = [], reactions = {} }:MovingEntityUpdateData = {} ) {
    const reactionResponses:Record<string, void | string> = {}
    reactions[ `stop-top` ] = (...params) => this.processStopTop( ...params )
    reactions[ `stop` ] = (...params) => this.processStop( ...params )

    if (!this.groundedOn) {
      const gravity = this.gravity * gameSpeedMultiplier

      // console.log( `gravity`, gravity, gameSpeedMultiplier )
      if (this.velocity.y > 0) this.velocity.y += gravity * 2
      else {
        this.velocity.y += gravity
      }
    }

    const beforeMove = { x:this.x, y:this.y }
    const velocity = {
      x: this.velocity.x * gameSpeedMultiplier,
      y: this.velocity.y * gameSpeedMultiplier,

    }
    this.x += velocity.x
    this.y += velocity.y

    for (const solid of surroundingSolids) {
      if (!this.velocity.x && !this.velocity.y && solid instanceof MovingEntity && (!solid.velocity.x && !solid.velocity.y)) continue

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

      if (velocity.y < 0 && onTheSolidTop) continue
      else if (velocity.y > 0 && onTheSolidBottom) continue

      const entityVelocityY = velocity.y === 0 && solid instanceof MovingEntity ? -solid.velocity.y : velocity.y

      const yCheckPassed = onTheSolidLeft || onTheSolidRight || entityVelocityY === 0 ? false : entityVelocityY < 0
        ? onTheSolidBottom && topDist + entityVelocityY <= 0
        : onTheSolidTop && bottomDist - entityVelocityY <= 0

      const xCheckPassed = onTheSolidTop || onTheSolidBottom || velocity.x === 0 ? false : velocity.x < 0
        ? onTheSolidRight && leftDist + velocity.x <= 0
        : onTheSolidLeft && rightDist - velocity.x <= 0

      // if (Math.abs( bottomDist ) < 3 && this.constructor.name.includes( `Play` ) && solid.constructor.name.includes( `Term` )) console.log({
      //   movingEnt: solid instanceof MovingEntity,
      //   onTheSolidTop,
      //   onTheSolidBottom,
      //   solid: {
      //     x: solid.x,
      //     y: solid.y,
      //     yTop: solid.y + solid.halfHeight,
      //     vy: solid.velocity?.y,
      //   },
      //   player: {
      //     x: this.x,
      //     y: this.y,
      //     yTop: this.y + this.halfHeight,
      //     vy: this.velocity.y,
      //   },
      //   yCheckPassed,
      //   topDist,
      //   bottomDist,
      //   entityVelocityY,
      // })

      if (yCheckPassed || xCheckPassed) {
        // if (this.constructor.name.includes( `Play` ) && solid.constructor.name.includes( `Term` )) console.log({
        //   yCheckPassed,
        //   entityVelocityY,
        //   check: yCheckPassed && entityVelocityY > 0,
        //   reactions,
        // })
        for (const label of solid.labels) {
          reactionResponses[ label ] = reactions[ label ]?.( { entity:solid, velocity }, {
            left: xCheckPassed && this.velocity.x > 0,
            right: xCheckPassed && this.velocity.x < 0,
            top: yCheckPassed && entityVelocityY < 0,
            bottom: yCheckPassed && entityVelocityY > 0,
          } )
        }
      }

      // if (this.velocity.x === 0 && this.velocity.y === 0) break
    }

    super.update( gameSpeedMultiplier )

    return reactionResponses
  }
}
