import type Game from "../../Game"
import sandImage from "../../assets/sprites/sand.png"
import waterImage from "../../assets/sprites/water.png"
import { Sprite } from "../../logic/engine"
import { isPointInside, type Point } from "../../logic/world"
import Entity, { type HitTarget } from "../Entity"
import type { HitStats } from "./items"

/**
 * - `look`: what flies (sand by default)
 * - `hit` and `getTargets`: what it does to the first target it passes through, and who it can hit; nobody without them
 * - `onLand`: called where it lands, or under whoever it hits (e.g. water leaving a puddle)
 */
export type ProjectileOptions = {
  look?: keyof typeof LOOKS
  hit?: HitStats
  getTargets?: () => Iterable<HitTarget>
  onLand?: (point:Point) => void
}

/** Flight shape in world units: thrown from `startHeight` above the ground, rising `arcHeight` more halfway. */
const FLIGHT = { startHeight:7, arcHeight:6 }

/** Shadow under the flying thing. */
const SHADOW = { width:3, height:1, opacity:0.35 }

/** What can fly, each shared by all projectiles that look like it. */
const LOOKS = {
  sand: new Sprite({ fly:{ src:sandImage } }, `fly` ),
  water: new Sprite({ fly:{ src:waterImage } }, `fly` ),
}

/**
 * Something thrown (a clump of sand, a splash of water). `x`, `y` is its shadow on the ground, flying straight to where
 * it lands; the thing itself arcs above it and hits the first target whose hurtbox it passes through.
 */
export default class Projectile extends Entity {
  isDone = false
  debugColor = `#fde047`
  #start: Point
  #landing: Point
  #distance: number
  #speed: number
  #traveled = 0
  #options: ProjectileOptions

  /** `speed` in world units per second. */
  constructor( game:Game, from:Point, landing:Point, speed:number, options:ProjectileOptions = {} ) {
    super( game, from.x, from.y, { width:2, height:2 } )
    this.#start = { ...from }
    this.#landing = landing
    this.#distance = Math.hypot( landing.x - from.x, landing.y - from.y ) || 1
    this.#speed = speed
    this.#options = options
  }

  /** How high above its shadow it flies now. */
  get height() {
    const progress = this.#traveled / this.#distance
    return FLIGHT.startHeight * (1 - progress) + FLIGHT.arcHeight * 4 * progress * (1 - progress)
  }

  update( seconds:number ) {
    if (this.isDone) return

    this.#traveled = Math.min( this.#distance, this.#traveled + this.#speed * seconds )

    const progress = this.#traveled / this.#distance
    this.x = this.#start.x + (this.#landing.x - this.#start.x) * progress
    this.y = this.#start.y + (this.#landing.y - this.#start.y) * progress

    this.#hit()
    if (this.isDone || this.#traveled < this.#distance) return

    this.isDone = true
    this.#options.onLand?.({ x:this.x, y:this.y })
  }

  draw( ctx:CanvasRenderingContext2D ) {
    const { width, height, opacity } = SHADOW

    ctx.globalAlpha = opacity
    ctx.fillStyle = `#000000`
    ctx.fillRect( this.x - width / 2, this.y - height / 2, width, height )
    ctx.globalAlpha = 1

    LOOKS[ this.#options.look ?? `sand` ].draw( ctx, this.x, this.y - this.height, { anchor:{ x:0.5, y:0.5 } } )
  }

  /** Hits the first target it flies through, and is gone. */
  #hit() {
    const { hit, getTargets } = this.#options
    if (!hit || !getTargets) return

    const flyingPoint = { x:this.x, y:this.y - this.height }

    for (const target of getTargets()) {
      const hurtbox = target.hurtbox
      if (!hurtbox || !target.isHittable || !isPointInside( flyingPoint, hurtbox )) continue

      target.takeHit( this.getDirectionTo( target ), hit )
      this.isDone = true
      this.#options.onLand?.({ x:target.x, y:target.y })
      return
    }
  }
}
