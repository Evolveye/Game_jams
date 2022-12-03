import { useTheme as jssUseTheme } from "react-jss"
import { AtomsStruct, Primitive, StylesCreator, Theme, ThemeConfig, ThemeWithActions, ThemeWithActionsFrom, UserDefinedStyles } from "./types"
import createStylesHook, { UseStyles } from "./createStylesHook"

type StylesHookCreator<Them extends Theme<any, any, any, any>> = <Classes extends UserDefinedStyles>(stylesCreator:Classes | StylesCreator<Them, Classes>) => UseStyles<Classes, ThemeWithActionsFrom<Them>>
type Theming<
  State extends Record<string, Primitive>,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
> = {
  themeConfig: ThemeConfig<State, Atoms, Mixins, Components>
  useTheme: () => ThemeWithActions<State, Atoms, Mixins, Components>
  createStylesHook: StylesHookCreator<Theme<State, Atoms, Mixins, Components>>
}

export type ThemeFromConfig<Config extends ThemeConfig<any, any, any, any>> = Config extends ThemeConfig<infer S, infer A, infer M, infer C> ? Theme<S, A, M, C> : never

export function createTheming<
  State extends Record<string, Primitive> = {},
  Atoms extends AtomsStruct = {},
  Mixins extends UserDefinedStyles = UserDefinedStyles,
  Components extends UserDefinedStyles = UserDefinedStyles,
>( themeConfig:ThemeConfig<State, Atoms, Mixins, Components> ):Theming<State, Atoms, Mixins, Components>

export function createTheming<Them extends ThemeConfig<any, any, any, any>>( themeConfig:Them ) {
  const themedCreateStylesHook = <Classes extends UserDefinedStyles = UserDefinedStyles>(stylesCreator:Classes | StylesCreator<ThemeFromConfig<Them>, Classes>) =>
    createStylesHook<Classes, ThemeFromConfig<Them>>( stylesCreator )

  const useTheme = jssUseTheme

  return { themeConfig, createStylesHook:themedCreateStylesHook, useTheme }
}
