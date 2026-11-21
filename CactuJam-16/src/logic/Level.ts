import type { GameEvents } from "../Game"
import type Game from "../Game"
import type { BriefTextPart } from "../components/Brief.svelte"
import type { ToyKind } from "../entities/items/items"
import ToyPickup from "../entities/items/ToyPickup"
import Kid from "../entities/kids/Kid"
import type { Shot } from "../scenes/SlidesScene"
import type { ActionOf, Listener, PlayOptions, SoundHandle } from "./engine"
import { SOUNDS } from "./sounds"
import { MOM, PLAYER, type Speaker } from "./speakers"
import { WORLD, type Point, type Rect } from "./world"

export type LevelScript = (level:Level) => Promise<void>

/** Where a kid starts, and the toys it holds (dropped when it is beaten). */
export type KidSpawn = Point & { toys?:ToyKind[] }

/**
 * - `speaker`: who says it, by default the player's kid
 * - `seconds`: how long the subtitle stays
 * - `sound`: played with the line instead of the speaker's voice, e.g. a shout
 */
export type SayOptions = { speaker?:Speaker, seconds?:number, sound?:string }

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
  #conditions = new Set<Condition>()
  #game: null | Game = null
  #abortCtrl = new AbortController()
  /** The sound of the last line, cut off by the next one. */
  #voice: null | SoundHandle = null

  constructor(
    readonly name: string,
    readonly script: LevelScript,
    /** Story shown before the day starts. */
    readonly story: Shot[] = [],
  ) {}

  get #runningGame() {
    if (!this.#game) throw new Error( `Level "${this.name}" is not running` )
    return this.#game
  }

  /** The player, for conditions in the script, e.g. `level.player.isInside( SANDBOX )`. */
  get player() {
    return this.#runningGame.player
  }

  async run( game:Game ) {
    this.abort()

    const abortCtrl = new AbortController()

    this.#game = game
    this.#abortCtrl = abortCtrl
    this.kids.clear()
    this.toys.clear()
    this.#conditions.clear()
    game.player.bounds = WORLD
    game.view.setSpeech( null )
    game.view.addBriefEntry({ variant:`heading`, source:`day`, text:this.name })

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
    for (const toy of this.toys) {
      toy.update()
      if (toy.isTaken) this.toys.delete( toy )
    }

    for (const kid of this.kids) {
      kid.update( seconds )
      if (kid.isGone) this.#removeKid( kid )
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

  giveToy( kind:ToyKind ) {
    const game = this.#runningGame

    game.player.inventory.add( kind )
    game.events.emit( `toyReceived`, { kind } )
  }

  placeToy( kind:ToyKind, x:number, y:number ) {
    this.toys.add( new ToyPickup( this.#runningGame, kind, x, y ) )
  }

  /** Puts peacefully playing kids at the given spots, optionally holding toys. Returns them in the same order. */
  spawnKids( spots:KidSpawn[] ) {
    const game = this.#runningGame

    return spots.map( ({ x, y, toys = [] }) => {
      const kid = new Kid( game, x, y )

      for (const kind of toys) kid.inventory.add( kind )

      this.kids.add( kid )
      game.events.emit( `kidSpawned`, { kid } )

      return kid
    } )
  }

  angerKids() {
    for (const kid of this.kids) kid.becomeHostile()
  }

  /** Mom calls for dinner: kids run home, and the day ends once the player walks off the playground. */
  async callForDinner() {
    for (const kid of this.kids) kid.flee()

    this.confinePlayer( null )
    await this.say( `OBIAD!`, { speaker:MOM, seconds:3, sound:SOUNDS.momCall } )
    await this.waitUntil( () => this.player.isOutside( WORLD ) )
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
