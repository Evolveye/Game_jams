const GameStatus = {
  NOT_STARTED: `NOT_STARTED`,
  STARTED: `STARTED`,
} as const

export type GameStatus = keyof typeof GameStatus

export default GameStatus
