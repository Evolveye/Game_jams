import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage"

/** What an achievement is called and what it asks for. Locked ones show the description too, as a goal. */
export type AchievementDefinition = { name:string, description:string }

/** Unlock times (ms since epoch) of the unlocked achievements. */
type UnlockTimes = Partial<Record<AchievementId, number>>

/** Every achievement of the game, in the order shown. More come from DESIGN-2.md. */
export const ACHIEVEMENTS = {
  storyEnd: { name:`Król piaskownicy`, description:`Przejdź wszystkie dni.` },
} satisfies Record<string, AchievementDefinition>

export type AchievementId = keyof typeof ACHIEVEMENTS

const STORAGE_KEY = `achievements`

/** The player's unlocked achievements, kept in the browser between runs. */
export default class Achievements {
  #unlockTimes: UnlockTimes = loadFromStorage<UnlockTimes>( STORAGE_KEY, {} )

  isUnlocked( id:AchievementId ) {
    return this.#unlockTimes[ id ] !== undefined
  }

  /** Unlocks it for good. Returns true only the first time. */
  unlock( id:AchievementId ) {
    if (this.isUnlocked( id )) return false

    this.#unlockTimes[ id ] = Date.now()
    saveToStorage( STORAGE_KEY, this.#unlockTimes )

    return true
  }

  /** Locks every achievement again, also in the browser. */
  clear() {
    this.#unlockTimes = {}
    removeFromStorage( STORAGE_KEY )
  }

  /** All achievements in order, each with its unlock time (`null` while locked). */
  getList() {
    return Object.entries( ACHIEVEMENTS ).map( ([ id, definition ]) => ({
      id: id as AchievementId,
      ...definition,
      unlockedAt: this.#unlockTimes[ id as AchievementId ] ?? null,
    }) )
  }
}
