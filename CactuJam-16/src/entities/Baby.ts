import type Game from "../Game"
import babySheet from "../assets/sprites/baby.png"
import { Sprite } from "../logic/engine"
import { SOUNDS } from "../logic/sounds"
import { SANDBOX, type Point, type Rect } from "../logic/world"
import Entity from "./Entity"

/**
 * `sitting` stays in place, `crawling` slowly wanders around its area, `following` crawls after the player
 * once the fight starts, and stops just out of the way (not close enough to be bothered).
 */
export type BabyMode = `sitting` | `crawling` | `following`

/** - `mode`: sitting (default), crawling or following; `bounds`: the area it crawls in (the sandbox by default) */
export type BabyOptions = { mode?:BabyMode, bounds?:Rect }

/** Baby tuning, in world units and seconds. */
const STATS = {
  /** The player this close (gap between footprints) upsets the baby. */
  annoyGap: 6,
  /** Seconds of the player next to it until it bursts into tears, and seconds to calm down from the edge of crying. */
  secondsToCry: 2,
  secondsToCalm: 3,
  /** How upset (0 to 1) it is when it looks uneasy, and when it starts sobbing. */
  uneasyFrom: 0.3,
  sobbingFrom: 0.65,
  crawlSpeed: 5,
  crawlRange: 25,
  /** A following baby stops this close to the player (gap between footprints): just beyond `annoyGap`. */
  followGap: 9,
  restTime: { min:1.5, max:4 },
}

/** The baby's sheet: 12×12 frames in one row (calm, uneasy, sobbing, crying ×2). */
const SHEET = { src:babySheet, framesPerRow:5, framesPerColumn:1 }

const ANIMATIONS = {
  calm: { ...SHEET, firstFrame:0, framesCount:1 },
  uneasy: { ...SHEET, firstFrame:1, framesCount:1 },
  sobbing: { ...SHEET, firstFrame:2, framesCount:1 },
  crying: { ...SHEET, firstFrame:3, framesCount:2, fps:6 },
}

/**
 * A baby on the playground. Any hit by the player, stepping on it (walking into it), or standing next to it for too long
 * makes it cry, and a crying baby loses the day (see `Level`). Nobody walks through it; kids leave it alone.
 */
export default class Baby extends Entity {
  mode: BabyMode
  bounds: Rect
  /** From 0 (calm) to 1 (bursts into tears); its face shows how upset it is. */
  upset = 0
  isCrying = false
  /** Content for good, e.g. once the day is won: it does not react anymore. */
  isContent = false
  sprite = new Sprite( ANIMATIONS, `calm` )
  hurtboxSize = { width:10, height:11 }
  debugColor = `#c4b5fd`
  #crawlTarget: null | Point = null
  #restTime = 0

  constructor( game:Game, x:number, y:number, { mode = `sitting`, bounds = SANDBOX }:BabyOptions = {} ) {
    super( game, x, y, { width:8, height:3 } )
    this.mode = mode
    this.bounds = bounds
    this.#restTime = Math.random() * STATS.restTime.max
  }

  get isHittable() {
    return !this.isCrying && !this.isContent
  }

  /** True once it looks uneasy (or worse): the player is bothering it. */
  get isUneasy() {
    return this.upset >= STATS.uneasyFrom
  }

  /** Any hit by the player makes it cry at once. */
  takeHit() {
    this.cry()
  }

  /** Bursts into tears: heard by everyone, and the day is lost. */
  cry() {
    if (!this.isHittable) return

    this.isCrying = true
    this.upset = 1
    this.game.sounds.play( SOUNDS.babyCry )
    this.game.events.emit( `babyCried` )
  }

  update( seconds:number ) {
    if (this.isHittable) {
      this.#feelThePlayer( seconds )
      if (this.mode === `crawling`) this.#crawl( seconds )
      if (this.mode === `following`) this.#follow( seconds )
    }

    // Nobody walks through the baby.
    this.game.player.separateFrom( this )

    this.sprite.play( this.#getAnimation() )
    this.sprite.update( seconds )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    this.drawSprite( ctx, this.sprite )
  }

  /** Cries at once when the player steps on it; gets upset while they stand close, and calms down when they leave. */
  #feelThePlayer( seconds:number ) {
    const gap = this.measureGapTo( this.game.player )
    if (gap <= 0) return this.cry()

    const isPlayerClose = gap <= STATS.annoyGap

    if (isPlayerClose) this.upset += seconds / STATS.secondsToCry
    else this.upset = Math.max( 0, this.upset - seconds / STATS.secondsToCalm )

    if (this.upset >= 1) this.cry()
  }

  /**
   * Crawls after the player (within its area) while kids attack them, stopping just out of the way:
   * it gets underfoot, but never upsets itself. Before the fight it stays where it is.
   */
  #follow( seconds:number ) {
    const player = this.game.player
    if (!this.game.level?.isFighting || this.measureGapTo( player ) <= STATS.followGap) return

    this.moveTowards( this.clampInside( player, this.bounds ), STATS.crawlSpeed * this.groundSpeedFactor, seconds )
  }

  /** Crawls slowly between random spots nearby, resting at each one. */
  #crawl( seconds:number ) {
    if (this.#restTime > 0) {
      this.#restTime -= seconds
      return
    }

    if (!this.#crawlTarget) {
      const { crawlRange } = STATS
      const spot = { x:this.x + (Math.random() - 0.5) * crawlRange * 2, y:this.y + (Math.random() - 0.5) * crawlRange * 2 }

      this.#crawlTarget = this.clampInside( spot, this.bounds )
    }

    if (!this.moveTowards( this.#crawlTarget, STATS.crawlSpeed * this.groundSpeedFactor, seconds )) return

    const { min, max } = STATS.restTime

    this.#crawlTarget = null
    this.#restTime = min + Math.random() * (max - min)
  }

  #getAnimation(): keyof typeof ANIMATIONS {
    if (this.isCrying) return `crying`
    if (this.upset >= STATS.sobbingFrom) return `sobbing`
    if (this.upset >= STATS.uneasyFrom) return `uneasy`

    return `calm`
  }
}
