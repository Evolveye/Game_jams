import createGameContext from "@lib/gameEngine/view/createGameContext"
import CactuJam11Game from "./logic"

export const { useGameContext, GameContextProvider } = createGameContext<CactuJam11Game>()
