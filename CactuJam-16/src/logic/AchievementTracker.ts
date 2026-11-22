import type Game from "../Game"
import { ITEMS, type ItemKind, type ToyKind } from "../entities/items/items"
import { findAct } from "../levels"
import type Level from "./Level"

/** Toys that can be used in a fight (the moulds have no use yet), all needed for the "Kolekcjoner" achievement. */
const USABLE_TOYS = (Object.keys( ITEMS ) as ItemKind[]).filter( (kind):kind is ToyKind => {
  const { swing, throwing, watering, ride } = ITEMS[ kind ]
  return kind !== `fist` && Boolean( swing ?? throwing ?? watering ?? ride )
} )

/**
 * Watches one day for the achievements won in it (see `ACHIEVEMENTS`) and counts what the whole-run ones need
 * (`GameStats`). The day is won when Mom calls for dinner: the day's achievements are decided then.
 * Everything it listens to stops with the day (also when it is lost or left).
 */
export default class AchievementTracker {
  #game: Game
  #level: Level
  #dayIndex: number
  /** The player had a toy from the start: only then a day with bare fists is a choice. */
  #hadToys: boolean
  #hasUsedToy = false
  #hasRidden = false
  #wasHit = false
  #wasToyStolen = false
  #hadPuddles = false
  #steppedInPuddle = false
  #upsetBaby = false
  #leftCar = false

  /** Call right after the level starts running, so its listeners stop with this day. */
  constructor( game:Game, level:Level, dayIndex:number ) {
    this.#game = game
    this.#level = level
    this.#dayIndex = dayIndex
    this.#hadToys = game.player.inventory.items.some( item => item.kind !== `fist` )

    level.on( `toyUsed`, ({ kind }) => this.#markUsed( kind ) )
    level.on( `playerHit`, () => this.#wasHit = true )
    level.on( `toyStolen`, () => this.#wasToyStolen = true )

    // Beaten with the toy it holds itself (checked before it drops its toys).
    level.on( `kidHit`, ({ kid, kind }) => {
      if (kind && kind !== `fist` && kid.health.isEmpty && kid.inventory.has( kind )) game.announceAchievement( `returnToSender` )
    } )

    level.waitUntil( () => game.player.isRiding ).then( () => this.#markUsed( `car` ) )
    level.waitUntil( () => level.puddles.size > 0 ).then( () => this.#hadPuddles = true )
    level.waitUntil( () => game.player.groundSpeedFactor < 1 ).then( () => this.#steppedInPuddle = true )
    level.waitUntil( () => [ ...level.babies ].some( baby => baby.isUneasy ) ).then( () => this.#upsetBaby = true )

    if (level.isStuntDay) level.waitUntil( () => level.isFighting && !game.player.isRiding ).then( () => this.#leftCar = true )

    level.waitFor( `dinnerCalled` ).then( () => this.#finishDay() )
  }

  /** Remembers a used toy, for this day and the run. Every toy kind used in one run unlocks "Kolekcjoner". */
  #markUsed( kind:ItemKind ) {
    if (kind === `fist`) return

    const { usedKinds } = this.#game.stats

    this.#hasUsedToy = true
    if (kind === `car`) this.#hasRidden = true
    if (!usedKinds.includes( kind )) usedKinds.push( kind )
    if (USABLE_TOYS.every( toy => usedKinds.includes( toy ) )) this.#game.announceAchievement( `collector` )
  }

  /** The day is won: its achievements, and the counters of the run. */
  #finishDay() {
    const game = this.#game
    const level = this.#level
    const { stats } = game

    if (this.#hadToys && !this.#hasUsedToy) game.announceAchievement( `bareFists` )
    if (!this.#wasHit) game.announceAchievement( `untouchable` )
    if (level.hasThieves && !this.#wasToyStolen) game.announceAchievement( `thiefCatcher` )
    if (this.#hadPuddles && !this.#steppedInPuddle) game.announceAchievement( `dryFeet` )
    if (level.babies.size && !this.#upsetBaby) game.announceAchievement( `nanny` )
    if (level.isStuntDay && this.#hasRidden && !this.#leftCar) game.announceAchievement( `stuntman` )

    if (!this.#hasUsedToy) stats.fistOnlyDays++
    if (game.player.inventory.has( `spade` )) stats.spadeDays++

    // Days without a hit, counted from the first day of the act; the whole act without one unlocks "Ani draśnięcia".
    const act = findAct( this.#dayIndex )

    stats.hitlessDays = this.#wasHit ? 0 : (this.#dayIndex === act.firstDay ? 1 : stats.hitlessDays + 1)
    if (this.#dayIndex === act.lastDay && stats.hitlessDays >= act.lastDay - act.firstDay + 1) game.announceAchievement( `spotless` )
  }
}
