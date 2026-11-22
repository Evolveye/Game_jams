import type { GameStats } from "../Game"
import { ITEMS, type ItemKind } from "../entities/items/items"
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage"

/** What a day started with: enough to play it again from its start. */
export type DayStart = { inventory:ItemKind[], stats:GameStats }

/**
 * - `lastDay`: the day started most recently, where "continue" goes back to
 * - `reachedDays`: the inventory each reached day started with the last time (by level index), for choosing a level
 */
type SavedProgress = {
  lastDay: null | DayStart & { index:number }
  reachedDays: Record<number, ItemKind[]>
}

const STORAGE_KEY = `progress`

/** The player's progress through the days, kept in the browser between visits. */
export default class Progress {
  #saved: SavedProgress
  #daysCount: number

  /** `daysCount`: how many days the game has; saved days beyond it (e.g. removed levels) are ignored. */
  constructor( daysCount:number ) {
    this.#daysCount = daysCount
    this.#saved = this.#load()
  }

  /** True once any day was started. */
  get hasPlayed() {
    return this.#saved.lastDay !== null
  }

  get lastDay() {
    const lastDay = this.#saved.lastDay
    return lastDay && { ...lastDay, inventory:[ ...lastDay.inventory ], stats:{ ...lastDay.stats } }
  }

  /** Indexes of the reached days, in order. */
  getReachedDays() {
    return Object.keys( this.#saved.reachedDays ).map( Number ).sort( (a, b) => a - b )
  }

  /** The inventory the day started with when it was last played, or bare hands for a day not reached yet. */
  getDayInventory( index:number ): ItemKind[] {
    return [ ...this.#saved.reachedDays[ index ] ?? [ `fist` ] ]
  }

  /** Remembers a day being started, so it can be continued or chosen later. */
  saveDayStart( index:number, { inventory, stats }:DayStart ) {
    this.#saved.lastDay = { index, inventory:[ ...inventory ], stats:{ ...stats } }
    this.#saved.reachedDays[ index ] = [ ...inventory ]

    saveToStorage( STORAGE_KEY, this.#saved )
  }

  /** Forgets every reached day, also in the browser. */
  clear() {
    this.#saved = { lastDay:null, reachedDays:{} }
    removeFromStorage( STORAGE_KEY )
  }

  /** The saved progress, without anything that no longer fits the game (removed days, unknown items). */
  #load(): SavedProgress {
    const saved = loadFromStorage<Partial<SavedProgress>>( STORAGE_KEY, {} )
    const isDay = (index:number) => Number.isInteger( index ) && index >= 0 && index < this.#daysCount
    const isInventory = (inventory:unknown): inventory is ItemKind[] => Array.isArray( inventory ) && inventory.every( kind => kind in ITEMS )
    const reachedDays: Record<number, ItemKind[]> = {}

    for (const [ key, inventory ] of Object.entries( saved.reachedDays ?? {} )) {
      if (isDay( Number( key ) ) && isInventory( inventory )) reachedDays[ Number( key ) ] = inventory
    }

    const lastDay = saved.lastDay
    const isLastDayValid = lastDay && isDay( lastDay.index ) && isInventory( lastDay.inventory ) && typeof lastDay.stats === `object`

    return { lastDay:isLastDayValid ? lastDay : null, reachedDays }
  }
}
