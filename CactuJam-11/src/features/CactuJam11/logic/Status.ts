const GameStatus = {
  NOT_STARTED: `NOT_STARTED`,
  STARTED: `STARTED`,
  GAME_OVER: `GAME_OVER`,
} as const

export type GameStatus = keyof typeof GameStatus

export default GameStatus
