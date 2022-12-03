import { ThemeProvider as JSSThemeProvider } from "react-jss"
import { ReactNode, useEffect, useMemo } from "react"
import useObjectState from "../core/hooks/useObjectState"
import { Primitive, ThemeConfig, ThemeStateSetter } from "./types"
import createTheme from "./createTheme"

export type ThemeProviderProps = {
  themeConfig: ThemeConfig<any, any, any, any>
  children: ReactNode
}

export default function ThemeProvider({ children, themeConfig }:ThemeProviderProps) {
  const initialState = useMemo<Record<string, Primitive>>( () => themeConfig.state ?? {}, [ themeConfig ] )
  const [ themeState, setThemeState ] = useObjectState( initialState )
  const setState:ThemeStateSetter<typeof initialState> = (key, value) => setThemeState( key, value )
  const theme = useMemo( () => createTheme({ ...themeConfig, state:themeState }), [ themeConfig, themeState ] )

  useEffect( () => {
    themeConfig.onStateChange?.( themeState )
  }, [ themeState ] )

  return (
    <JSSThemeProvider theme={{ ...theme, state:themeState, setState }}>
      {children}
    </JSSThemeProvider>
  )
}
