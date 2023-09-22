/* eslint-disable @typescript-eslint/no-explicit-any */

import deepMergeObjects from "@lib/core/functions/deepMergeObjects"
import { AnyThemeConfig, AtomsStruct, Primitive, StateStruct, Theme, ThemeConfig, UserDefinedStyles } from "./types"

export default function createTheme<
  State extends Record<string, Primitive>,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
  InheritedConfig extends undefined | ThemeConfig<any, any, any, any, any> = undefined
>( themeCreator:ThemeConfig<State, Atoms, Mixins, Components, InheritedConfig> ): Theme<State, Atoms, Mixins, Components> {
  const inheritedConfig = themeCreator.inheritedConfig

  const state = deepMergeObjects( inheritedConfig?.state ?? {}, themeCreator.state as State ) as State
  // const state = (themeCreator.state ?? {}) as State

  const atoms = deepMergeObjects( inheritedConfig?.atoms?.({ state }) ?? {}, themeCreator?.atoms?.( { state } as any ) ?? {} ) as Atoms
  // const atoms = (themeCreator.atoms?.({ state }) ?? {}) as Atoms

  const mixins = ({ ...inheritedConfig?.mixins?.({ state, atoms }), ...themeCreator.mixins?.( { state, atoms } as any ) }) as Mixins
  // const mixins = (themeCreator.mixins?.({ state, atoms })) as Mixins

  const components = ({ ...inheritedConfig?.components?.({ state, atoms, mixins }), ...themeCreator.components?.( { state, atoms, mixins } as any ) }) as Components
  // const components = (themeCreator.components?.({ state, atoms, mixins }) ?? {}) as Components

  return {
    state,
    atoms,
    mixins,
    components,
  }
}

export function createThemeState( themeCreator:AnyThemeConfig ): StateStruct {
  const inheritedConfig = themeCreator.inheritedConfig
  const state = deepMergeObjects( inheritedConfig?.state ?? {}, themeCreator.state as StateStruct )

  return state
}
