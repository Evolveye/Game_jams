import createGameContext from "@lib/gameEngine/createGameContext"
import CactuJam11Game from "./logic"

export const { useGameContext, GameContextProvider } = createGameContext<CactuJam11Game>()
