import type { ToyKind } from "../entities/items/items"

/**
 * Counted during a run. Some are shown in the summary at its end, the rest decide the whole-run achievements.
 * - `isFullRun`: the run started on the first day, so it counts for the whole-run achievements
 * - `retries`: days played again from their start (after a loss, a restart, or continuing a saved day)
 * - `babiesCried`: babies made to cry (each one also loses the day)
 * - `fistOnlyDays`: days won without using any toy
 * - `spadeDays`: days ended with a spade in the pocket
 * - `hitlessDays`: days won in a row without a hit, counted from the first day of the current act
 * - `usedKinds`: toy kinds used in this run (riding counts for the car)
 */
export type GameStats = {
  playSeconds: number
  kidsBeaten: number
  hitsTaken: number
  daysCompleted: number
  isFullRun: boolean
  retries: number
  babiesCried: number
  fistOnlyDays: number
  spadeDays: number
  hitlessDays: number
  usedKinds: ToyKind[]
}

export const NEW_RUN_STATS:GameStats = {
  playSeconds: 0,
  kidsBeaten: 0,
  hitsTaken: 0,
  daysCompleted: 0,
  isFullRun: true,
  retries: 0,
  babiesCried: 0,
  fistOnlyDays: 0,
  spadeDays: 0,
  hitlessDays: 0,
  usedKinds: [],
}

/** Fresh stats for a run starting on the day; only a run from the first day counts for the whole-run achievements. */
export function createRunStats( dayIndex:number ) {
  return { ...copyStats( NEW_RUN_STATS ), isFullRun:dayIndex === 0 }
}

/** A copy that shares nothing with the original, so changing one never changes the other. */
export function copyStats( stats:GameStats ): GameStats {
  return { ...stats, usedKinds:[ ...stats.usedKinds ] }
}

/** Stats saved by an older version may miss newer counters: those start from zero, and the run does not count as full. */
export function completeStats( stats:Partial<GameStats> ) {
  return copyStats({ ...NEW_RUN_STATS, isFullRun:false, ...stats })
}
