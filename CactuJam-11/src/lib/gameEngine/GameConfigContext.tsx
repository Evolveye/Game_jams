import { createContext, useContext, ReactNode, MutableRefObject } from "react"

export type GameConfigContextValue = {
  preGameUIRef: MutableRefObject<HTMLElement>
}

export type GameConfigContextProviderProps = {
  children: ReactNode
  preGameUIRef: MutableRefObject<HTMLElement>
}

export const GameConfigContext = createContext<GameConfigContextValue | undefined>( undefined )
export default GameConfigContext

export function GameConfigContextProvider({ children }:GameConfigContextProviderProps) {
  return (
    <GameConfigContext.Provider value={undefined}>
      {children}
    </GameConfigContext.Provider>
  )
}

export function useGameConfigContext() {
  return useContext( GameConfigContext )
}
