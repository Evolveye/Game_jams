import { AtomsStruct, Primitive, Theme, ThemeConfig, UserDefinedStyles } from "./types"

export default function createTheme<
  State extends Record<string, Primitive>,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
>( themeCreator:ThemeConfig<State, Atoms, Mixins, Components> ): Theme<State, Atoms, Mixins, Components> {
  const state = (themeCreator.state ?? {}) as State
  const atoms = (themeCreator.atoms?.({ state }) ?? {}) as Atoms
  const mixins = (themeCreator.mixins?.({ state, atoms })) as Mixins
  const components = (themeCreator.components?.({ state, atoms, mixins }) ?? {}) as Components

  return {
    state,
    atoms,
    mixins,
    components,
  }
}
