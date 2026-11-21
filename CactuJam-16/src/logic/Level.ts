import type { GameEvents } from "../Game"
import type Game from "../Game"
import type { Listener } from "./engine"
import type { Enemy, EnemyKind, ToyKind } from "./types"

export type LevelScript = (level:Level) => Promise<void>

/** CSS of the debug log parts, applied with `%c` in `console.debug`. */
const DEBUG_STYLES = {
  badge: `background: rgba(232, 200, 114, 0.15); color: #c9a95c; padding: 1px 6px; border-radius: 3px;`,
  method: `color: #60a5fa; font-weight: bold;`,
  done: `color: #22c55e; font-weight: bold;`,
}

export default class Level {
  /** Logs every call the script makes on the level, and when the awaited ones finish. */
  debug = true

  enemies = new Set<Enemy>()
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
    this.enemies.clear()

    await this.script( this.debug ? this.#createDebugProxy() : this )
    if (abortCtrl.signal.aborted) return false

    abortCtrl.abort()
    return true
  }

  abort() {
    this.#abortCtrl.abort()
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

  async say( text:string, seconds = 2 ) {
    console.info( `💬 ${text}` )
    this.#runningGame.events.emit( `say`, { text } )

    await this.wait( seconds )
  }

  giveToy( kind:ToyKind ) {
    const game = this.#runningGame

    game.toys.push( kind )
    game.events.emit( `toyGiven`, { kind } )
  }

  spawn( kinds:EnemyKind[] ) {
    const game = this.#runningGame
    const margin = 16

    for (const kind of kinds) {
      const enemy = {
        kind,
        x: margin + Math.random() * (game.world.width - margin * 2),
        y: margin + Math.random() * (game.world.height - margin * 2),
      }

      this.enemies.add( enemy )
      game.events.emit( `enemySpawned`, { enemy } )
    }
  }

  removeEnemy( enemy:Enemy ) {
    if (!this.enemies.delete( enemy )) return

    const game = this.#runningGame

    game.events.emit( `enemyGone`, { enemy } )
    if (!this.enemies.size) game.events.emit( `allEnemiesGone` )
  }

  async callForDinner() {
    this.enemies.clear()
    await this.say( `OBIAD!`, 3 )
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
