import { createContext, useContext, ReactNode } from "react"
import { Game } from "."

export type GameContextValue = Game<any>

export type GameContextProviderProps<TGame extends Game<any>> = {
  children: ReactNode
  game: TGame
}

export default function createGameContext<TGame extends Game<any>>() {
  const GameContext = createContext<TGame | undefined>( undefined )

  return {
    useGameContext: () => {
      const ctx = useContext( GameContext )

      if (!ctx) throw new Error()

      return ctx
    },
    GameContextProvider: ({ children, game }:GameContextProviderProps<TGame>) => (
      <GameContext.Provider value={game}>
        {children}
      </GameContext.Provider>
    ),
  }
}
