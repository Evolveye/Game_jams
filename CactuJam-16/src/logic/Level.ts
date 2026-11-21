import type { GameEvents } from "../Game"
import type Game from "../Game"
import Kid from "../entities/kids/Kid"
import ToyPickup from "../entities/toys/ToyPickup"
import type { ToyKind } from "../entities/toys/toys"
import type { Listener } from "./engine"
import type { Point } from "./world"

export type LevelScript = (level:Level) => Promise<void>

const DEBUG_STYLES = {
  badge: `background: rgba(232, 200, 114, 0.15); color: #c9a95c; padding: 1px 6px; border-radius: 3px;`,
  method: `color: #60a5fa; font-weight: bold;`,
  done: `color: #22c55e; font-weight: bold;`,
}

export default class Level {
  debug = true

  kids = new Set<Kid>()
  toys = new Set<ToyPickup>()
  #game: null | Game = null
  #abortCtrl = new AbortController()

  constructor(
    readonly name: string,
    readonly script: LevelScript,
  ) {}

  get #runningGame() {
    if (!this.#game) throw new Error( `Level "${this.name}" is not running` )
    return this.#game
  }

  async run( game:Game ) {
    this.abort()

    const abortCtrl = new AbortController()

    this.#game = game
    this.#abortCtrl = abortCtrl
    this.kids.clear()
    this.toys.clear()
    game.view.setSpeech( null )

    await this.script( this.debug ? this.#createDebugProxy() : this )
    if (abortCtrl.signal.aborted) return false

    abortCtrl.abort()
    return true
  }

  abort() {
    this.#abortCtrl.abort()
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
  }

  wait( seconds:number ) {
    return this.#runningGame.timers.wait( seconds, this.#abortCtrl.signal )
  }

  waitFor<Name extends keyof GameEvents>( name:Name, predicate?:(payload:GameEvents[ Name ]) => boolean ) {
    return this.#runningGame.events.once( name, this.#abortCtrl.signal, predicate )
  }

  on<Name extends keyof GameEvents>( name:Name, listener:Listener<GameEvents[ Name ]> ) {
    this.#runningGame.events.on( name, listener, this.#abortCtrl.signal )
  }

  async say( text:string, seconds = 2.5 ) {
    const game = this.#runningGame

    game.view.setSpeech( text )
    game.events.emit( `say`, { text } )

    await this.wait( seconds )

    if (game.view.getSpeech() === text) game.view.setSpeech( null )
  }

  placePlayer( x:number, y:number ) {
    this.#runningGame.player.placeAt( x, y )
  }

  walkPlayerTo( x:number, y:number, speed?:number ) {
    return this.#untilAborted( this.#runningGame.player.walkTo({ x, y }, speed ) )
  }

  giveToy( kind:ToyKind ) {
    const game = this.#runningGame

    game.player.addToy( kind )
    game.events.emit( `toyReceived`, { kind } )
  }

  placeToy( kind:ToyKind, x:number, y:number ) {
    this.toys.add( new ToyPickup( this.#runningGame, kind, x, y ) )
  }

  spawnKids( spots:Point[] ) {
    const game = this.#runningGame

    for (const { x, y } of spots) {
      const kid = new Kid( game, x, y )

      this.kids.add( kid )
      game.events.emit( `kidSpawned`, { kid } )
    }
  }

  angerKids() {
    for (const kid of this.kids) kid.becomeHostile()
  }

  async callForDinner() {
    for (const kid of this.kids) kid.flee()
    await this.say( `OBIAD!`, 3 )
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
