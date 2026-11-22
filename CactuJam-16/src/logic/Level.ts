import type { GameEvents } from "../Game"
import type Game from "../Game"
import Baby, { type BabyOptions } from "../entities/Baby"
import type { BriefTextPart } from "../components/Brief.svelte"
import type { ToyKind } from "../entities/items/items"
import type { PuddleStats } from "../entities/items/items"
import type Projectile from "../entities/items/Projectile"
import Puddle from "../entities/Puddle"
import ToyPickup from "../entities/items/ToyPickup"
import Kid, { type KidOptions } from "../entities/kids/Kid"
import type { Shot } from "../scenes/SlidesScene"
import type { ActionOf, Listener, PlayOptions, SoundHandle } from "./engine"
import { SOUNDS } from "./sounds"
import { MOM, PLAYER, type Speaker } from "./speakers"
import { findPointBeyondEdge, SANDBOX, WORLD, type Point, type Rect } from "./world"

export type LevelScript = (level:Level) => Promise<void>

/** Where a kid starts, the toys it holds (dropped when it is beaten), and how it plays and fights. */
export type KidSpawn = Point & KidOptions & { toys?:ToyKind[] }

/**
 * - `speaker`: who says it, by default the player's kid
 * - `seconds`: how long the subtitle stays
 * - `sound`: played with the line instead of the speaker's voice, e.g. a shout
 */
export type SayOptions = { speaker?:Speaker, seconds?:number, sound?:string }

/** Why the day was lost, for the summary over the frozen world. */
export type DayLoss = { title:string, subtitle:string }

/**
 * - `story`: shown before the day starts
 * - `isStuntDay`: the day of the "Kaskader" achievement (won without leaving the car)
 */
export type LevelOptions = { story?:Shot[], isStuntDay?:boolean }

type Condition = {
  isMet: () => boolean
  resolve: () => void
}

const DEBUG_STYLES = {
  badge: `background: rgba(232, 200, 114, 0.15); color: #c9a95c; padding: 1px 6px; border-radius: 3px;`,
  method: `color: #60a5fa; font-weight: bold;`,
  done: `color: #22c55e; font-weight: bold;`,
}

export default class Level {
  kids = new Set<Kid>()
  toys = new Set<ToyPickup>()
  /** Thrown things in flight. */
  projectiles = new Set<Projectile>()
  /** Water on the ground, slowing down everyone in it until it dries. */
  puddles = new Set<Puddle>()
  /** Babies the player must not hurt or bother (see `Baby`). */
  babies = new Set<Baby>()
  /** True once the day is lost: only the babies move, while mom has her say. */
  isFrozen = false
  /** Set when the day is lost; the gameplay then shows the summary. */
  loss: null | DayLoss = null
  /** Thieves waiting off-screen, each sent in for the next dropped toy. */
  #lurkingThieves: KidOptions[] = []
  /** Thieves added this day, sent in or not. */
  #thievesCount = 0
  /** The player has walked fully into the sandbox this day; until then nobody can be hit. */
  #hasPlayerEntered = false
  #conditions = new Set<Condition>()
  #game: null | Game = null
  #abortCtrl = new AbortController()
  /** The sound of the last line, cut off by the next one. */
  #voice: null | SoundHandle = null

  readonly story: Shot[]
  readonly isStuntDay: boolean

  constructor( readonly name:string, readonly script:LevelScript, { story = [], isStuntDay = false }:LevelOptions = {} ) {
    this.story = story
    this.isStuntDay = isStuntDay
  }

  get #runningGame() {
    if (!this.#game) throw new Error( `Level "${this.name}" is not running` )
    return this.#game
  }

  /** The player, for conditions in the script, e.g. `level.player.isInside( SANDBOX )`. */
  get player() {
    return this.#runningGame.player
  }

  /** True once the player has walked fully into the sandbox this day. Kids cannot be hit before (see `Kid.isHittable`). */
  get hasPlayerEntered() {
    return this.#hasPlayerEntered
  }

  /** True when thieves were added this day (see `addLurkingThieves`). */
  get hasThieves() {
    return this.#thievesCount > 0
  }

  /** True while any kid attacks the player. */
  get isFighting() {
    for (const kid of this.kids) {
      if (kid.state === `hostile`) return true
    }

    return false
  }

  async run( game:Game ) {
    this.abort()

    const abortCtrl = new AbortController()

    this.#game = game
    this.#abortCtrl = abortCtrl
    this.kids.clear()
    this.toys.clear()
    this.projectiles.clear()
    this.puddles.clear()
    this.babies.clear()
    this.isFrozen = false
    this.loss = null
    this.#lurkingThieves = []
    this.#thievesCount = 0
    this.#hasPlayerEntered = false
    this.#conditions.clear()
    game.player.bounds = WORLD
    game.view.setSpeech( null )
    game.view.addBriefEntry({ variant:`heading`, source:`day`, text:this.name })

    // A crying baby loses the day.
    this.on( `babyCried`, () => this.#loseOverBaby() )

    // In debug mode the script's steps are logged (switching it on takes effect from the next day).
    await this.script( game.isDebug ? this.#createDebugProxy() : this )
    if (abortCtrl.signal.aborted) return false

    abortCtrl.abort()
    return true
  }

  abort() {
    this.#abortCtrl.abort()
    this.#voice?.stop()
  }

  update( seconds:number ) {
    for (const baby of this.babies) baby.update( seconds )
    if (this.isFrozen) return

    if (!this.#hasPlayerEntered && this.player.isInside( SANDBOX )) this.#hasPlayerEntered = true

    for (const toy of this.toys) {
      toy.update()
      if (toy.isTaken) this.toys.delete( toy )
    }

    for (const kid of this.kids) {
      kid.update( seconds )
      if (kid.isGone) this.#removeKid( kid )
    }

    for (const projectile of this.projectiles) {
      projectile.update( seconds )
      if (projectile.isDone) this.projectiles.delete( projectile )
    }

    for (const puddle of this.puddles) {
      puddle.update( seconds )
      if (puddle.isDry) this.puddles.delete( puddle )
    }

    for (const condition of this.#conditions) {
      if (!condition.isMet()) continue

      this.#conditions.delete( condition )
      condition.resolve()
    }
  }

  wait( seconds:number ) {
    return this.#runningGame.timers.wait( seconds, this.#abortCtrl.signal )
  }

  waitFor<Name extends keyof GameEvents>( name:Name, predicate?:(payload:GameEvents[ Name ]) => boolean ) {
    return this.#runningGame.events.once( name, this.#abortCtrl.signal, predicate )
  }

  /** Waits until the condition is true; it is checked once per frame. */
  waitUntil( isMet:() => boolean ) {
    const signal = this.#abortCtrl.signal

    return new Promise<void>( resolve => {
      if (signal.aborted) return

      const condition = { isMet, resolve }

      this.#conditions.add( condition )
      signal.addEventListener( `abort`, () => this.#conditions.delete( condition ), { once:true } )
    } )
  }

  on<Name extends keyof GameEvents>( name:Name, listener:Listener<GameEvents[ Name ]> ) {
    this.#runningGame.events.on( name, listener, this.#abortCtrl.signal )
  }

  /** Shows a line as a subtitle (and in the journal), then waits until it has been read. */
  async say( text:string, { speaker = PLAYER, seconds = 2.5, sound = speaker.voice }:SayOptions = {} ) {
    const game = this.#runningGame
    const speech = { text, label:speaker.name, color:speaker.color }

    this.#voice?.stop()
    this.#voice = sound ? game.sounds.play( sound, { rateVariation:0.08 } ) : null

    game.view.setSpeech( speech )
    game.view.addBriefEntry({ variant:`quote`, source:speaker.id, ...speech })
    game.events.emit( `say`, { text, speaker } )

    await this.wait( seconds )

    // A newer line may have replaced this one in the meantime.
    if (game.view.getSpeech() === speech) game.view.setSpeech( null )
  }

  /**
   * Writes an instruction or goal into the journal next to the game.
   * Parts are joined; keys from `getKeys()` are shown as keyboard keys.
   */
  note( ...parts:BriefTextPart[] ) {
    this.#runningGame.view.addBriefEntry({ variant:`note`, source:`note`, text:parts })
  }

  /** Keys bound to game actions, as a `note()` part shown as keyboard keys: `Space` `J`, or `WASD` `↑←↓→` for the moves. */
  getKeys( ...actions:ActionOf<typeof Game.controls>[] ) {
    return { keys:this.#runningGame.controls.getKeyLabels( ...actions ) }
  }

  /** Plays a sound, e.g. at the start of the day. */
  playSound( source:string, options?:PlayOptions ) {
    return this.#runningGame.sounds.play( source, options )
  }

  placePlayer( x:number, y:number ) {
    this.#runningGame.player.placeAt( x, y )
  }

  walkPlayerTo( x:number, y:number, speed?:number ) {
    return this.#untilAborted( this.#runningGame.player.walkTo({ x, y }, speed ) )
  }

  /** Keeps the player inside the area; `null` lets them walk off the playground. */
  confinePlayer( area:null | Rect ) {
    this.#runningGame.player.bounds = area
  }

  /** Waits until the player walks fully into the area (the sandbox by default), then keeps them inside it. */
  async confinePlayerOnEntry( area:Rect = SANDBOX ) {
    await this.waitUntil( () => this.player.isInside( area ) )
    this.confinePlayer( area )
  }

  giveToy( kind:ToyKind ) {
    const game = this.#runningGame

    game.player.inventory.add( kind )
    game.events.emit( `toyReceived`, { kind } )
  }

  placeToy( kind:ToyKind, x:number, y:number ) {
    const toy = new ToyPickup( this.#runningGame, kind, x, y )

    this.toys.add( toy )
    return toy
  }

  /** A toy falls out of a kid's hands. A thief waiting off-screen, if any, comes running for it. */
  dropToy( kind:ToyKind, x:number, y:number ) {
    const toy = this.placeToy( kind, x, y )
    const thief = this.#lurkingThieves.shift()

    if (thief) this.#sendThief( toy, thief )
  }

  /** Takes a toy off the ground, e.g. grabbed by a thief. */
  takeToy( toy:ToyPickup ) {
    toy.isTaken = true
    this.toys.delete( toy )
  }

  /**
   * Hides thieves off-screen: from now on each dropped toy sends one in to grab it (the nearest lying toy).
   * A thief scares away with one hit; grabbing the toy, it turns into a regular enemy holding it.
   * `options` are the kid it turns into; thieves wear bluish clothes (the `thief` body) unless they get another `body`.
   */
  addLurkingThieves( count:number, options:KidOptions = {} ) {
    for (let i = 0; i < count; i++) this.#lurkingThieves.push( options )
    this.#thievesCount += count
  }

  /** Puts peacefully playing kids at the given spots, optionally holding toys. Returns them in the same order. */
  spawnKids( spots:KidSpawn[] ) {
    return spots.map( spot => this.#addKid( this.#createKid( spot ) ) )
  }

  /**
   * Like `spawnKids`, but the kids come running in from the nearest edge of the playground, and attack once at their spots,
   * e.g. the next wave. Returns them in the same order.
   */
  spawnKidsFromEdge( spots:KidSpawn[] ) {
    return spots.map( spot => {
      const kid = this.#createKid( spot )

      kid.enterFrom( findPointBeyondEdge( spot ) )
      return this.#addKid( kid )
    } )
  }

  /**
   * Puts a baby on the playground, sitting in place or crawling around (`mode`). Hurting it, or standing next to it
   * for too long, makes it cry, and the day is lost.
   */
  placeBaby( x:number, y:number, options?:BabyOptions ) {
    const baby = new Baby( this.#runningGame, x, y, options )

    this.babies.add( baby )
    return baby
  }

  /** Everything the player's toys can hit: the kids, and the babies they must not hit. */
  getPlayerTargets() {
    return [ ...this.kids, ...this.babies ]
  }

  /** Puts a thrown thing in flight. */
  launch( projectile:Projectile ) {
    this.projectiles.add( projectile )
  }

  /** Leaves a puddle on the ground. */
  pour( point:Point, stats:PuddleStats ) {
    this.puddles.add( new Puddle( point, stats ) )
  }

  /** Speed multiplier at the point: the strongest slowdown of the puddles it stands in, or 1 on dry ground. */
  getGroundSpeedFactor( point:Point ) {
    let factor = 1

    for (const puddle of this.puddles) {
      if (puddle.contains( point )) factor = Math.min( factor, puddle.stats.slowdown )
    }

    return factor
  }

  angerKids() {
    for (const kid of this.kids) kid.becomeHostile()
  }

  /** Mom calls for dinner: kids run home, and the day ends once the player walks off the playground. */
  async callForDinner() {
    this.#runningGame.events.emit( `dinnerCalled` )

    for (const kid of this.kids) kid.flee()
    for (const baby of this.babies) baby.isContent = true

    this.confinePlayer( null )
    await this.say( `Sergiusz, obiad!`, { speaker:MOM, seconds:3, sound:SOUNDS.momCall } )
    await this.waitUntil( () => this.player.isOutside( WORLD ) )
  }

  /** A kid at its spot, holding its toys; not on the playground yet. */
  #createKid( { x, y, toys = [], ...options }:KidSpawn ) {
    const kid = new Kid( this.#runningGame, x, y, options )

    for (const kind of toys) kid.inventory.add( kind )
    return kid
  }

  #addKid( kid:Kid ) {
    this.kids.add( kid )
    this.#runningGame.events.emit( `kidSpawned`, { kid } )

    return kid
  }

  /** A thief comes onto the playground from the edge nearest to the toy. */
  #sendThief( toy:ToyPickup, options:KidOptions ) {
    const game = this.#runningGame
    const { x, y } = findPointBeyondEdge( toy )
    const thief = new Kid( game, x, y, { body:`thief`, ...options } )

    thief.state = `stealing`
    this.kids.add( thief )
    game.events.emit( `kidSpawned`, { kid:thief } )
  }

  /** The world freezes and mom has her say before the summary of the lost day. */
  async #loseOverBaby() {
    if (this.isFrozen) return

    this.isFrozen = true
    await this.say( `Coś ty zrobił temu dziecku?!`, { speaker:MOM, seconds:2.5 } )
    await this.say( `Wracamy do domu!`, { speaker:MOM, seconds:2 } )

    this.loss = { title:`Do domu!`, subtitle:`Rozpłakałeś bobasa. Mama nie była zachwycona.` }
  }

  #removeKid( kid:Kid ) {
    if (!this.kids.delete( kid )) return

    const game = this.#runningGame

    game.events.emit( `kidGone`, { kid } )
    if (!this.kids.size) game.events.emit( `allKidsGone` )
  }

  #untilAborted<Value>( promise:Promise<Value> ) {
    const signal = this.#abortCtrl.signal

    return new Promise<Value>( resolve => {
      promise.then( value => {
        if (!signal.aborted) resolve( value )
      } )
    } )
  }

  #createDebugProxy() {
    return new Proxy( this, {
      get: (target, key) => {
        const value = Reflect.get( target, key )
        if (typeof value !== `function`) return value

        return (...args:unknown[]) => {
          const label = `%cDEBUG · ${target.name}%c ${String( key )}`
          const labelStyles = [ DEBUG_STYLES.badge, DEBUG_STYLES.method ]
          const startTime = performance.now()

          console.debug( label, ...labelStyles, ...args )

          const result = value.apply( target, args )
          if (!(result instanceof Promise)) return result

          result.then( () => {
            const seconds = (performance.now() - startTime) / 1000
            console.debug( `${label} %c✓ ${seconds.toFixed( 2 )}s`, ...labelStyles, DEBUG_STYLES.done )
          } )

          return result
        }
      },
    } )
  }
}
