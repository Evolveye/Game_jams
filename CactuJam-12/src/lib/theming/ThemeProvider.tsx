/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThemeProvider as JSSThemeProvider, useTheme } from "react-jss"
import { ReactNode, useEffect, useMemo } from "react"
import deepMergeObjects from "@lib/core/functions/deepMergeObjects"
import useObjectState from "../core/hooks/useObjectState"
import { StateStruct, Theme, ThemeConfig, ThemeStateSetter } from "./types"
import createTheme from "./createTheme"

export type ThemeProviderProps<T> = {
  themeConfig: T
  children: ReactNode
}

export default function ThemeProvider<T extends ThemeConfig<any, any, any, any, any>>({ children, themeConfig }:ThemeProviderProps<T>) {
  const [ state, stateActions ] = useObjectState( themeConfig.state as StateStruct )
  const theme = useMemo( () => createTheme({ ...themeConfig, state }), [ themeConfig, state ] )

  const setState:ThemeStateSetter<typeof state> = (key, value) => stateActions( key, value )

  useEffect( () => {
    document.querySelector( `[data-jss-ssr]` )?.remove()
  }, [] )

  useEffect( () => {
    themeConfig.onStateChange?.( state as any )
  }, [ state, themeConfig ] )

  return (
    <JSSThemeProvider theme={{ ...theme, state, setState }}>
      {children}
    </JSSThemeProvider>
  )
}

export function NestedThemeProvider<T extends ThemeConfig<any, any, any, any, any>>({ children, themeConfig }:ThemeProviderProps<T>) {
  const inheritedTheme = useTheme() as Theme<any, any, any, any>
  const [ state, stateActions ] = useObjectState( deepMergeObjects( inheritedTheme?.state ?? {}, themeConfig.state as StateStruct ) )
  const theme = useMemo( () => createTheme({ ...themeConfig, state }), [ themeConfig, state ] )

  const setState:ThemeStateSetter<typeof state> = (key, value) => stateActions( key, value )

  useEffect( () => {
    if (inheritedTheme) stateActions( deepMergeObjects( inheritedTheme?.state ?? {}, themeConfig.state as StateStruct ) )
  }, [ (inheritedTheme as any)?.state ] )

  useEffect( () => {
    themeConfig.onStateChange?.( state as any )
  }, [ state, themeConfig ] )

  return (
    <JSSThemeProvider theme={{ ...theme, state, setState }}>
      {children}
    </JSSThemeProvider>
  )
}
