import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage"

/** What an achievement is called and what it asks for. Locked ones show the description too, as a goal. */
export type AchievementDefinition = { name:string, description:string }

/** Unlock times (ms since epoch) of the unlocked achievements. */
type UnlockTimes = Partial<Record<AchievementId, number>>

/**
 * Every achievement of the game, in the order shown (see DESIGN-2.md): the story, then those won in a single day
 * (`AchievementTracker`), then those for a whole run from the first day (checked at the end of the story).
 */
export const ACHIEVEMENTS = {
  storyEnd: { name:`Król piaskownicy`, description:`Przejdź wszystkie dni.` },

  bareFists: { name:`Gołe pięści`, description:`Wygraj dzień, mając zabawki w kieszeni, ale walcząc tylko pięściami.` },
  untouchable: { name:`Nietykalny`, description:`Wygraj dzień, ani razu nie obrywając.` },
  thiefCatcher: { name:`Złodziej złodziei`, description:`Wygraj dzień ze złodziejami, nie dając im ukraść żadnej zabawki.` },
  dryFeet: { name:`Sucha stopa`, description:`Wygraj dzień z kałużami, ani razu w nie nie wchodząc.` },
  returnToSender: { name:`Odbite piłeczki`, description:`Pokonaj dzieciaka tą samą zabawką, którą sam walczy.` },
  nanny: { name:`Niania`, description:`Wygraj dzień z bobasem, nie niepokojąc go ani razu.` },
  stuntman: { name:`Kaskader`, description:`Pokonaj czołg (dzień 18), ani na chwilę nie wysiadając z autka w trakcie bójki.` },

  fistSchool: { name:`Szkoła pięści`, description:`Przejdź całą grę od 1. dnia, walcząc tylko pięściami.` },
  spadeLoyal: { name:`Wierny łopatce`, description:`Przejdź całą grę od 1. dnia, kończąc każdy dzień z łopatką w kieszeni.` },
  collector: { name:`Kolekcjoner`, description:`W jednej grze użyj łopatki, wiaderka, konewki i autka.` },
  goodBoy: { name:`Grzeczny chłopiec`, description:`Przejdź całą grę od 1. dnia, nie doprowadzając żadnego bobasa do płaczu.` },
  spotless: { name:`Ani draśnięcia`, description:`Przejdź cały akt, ani razu nie obrywając.` },
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
