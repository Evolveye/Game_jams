/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react"
import { ObjectsDeepMerge } from "@lib/core/types/ObjectKeys"
import { ThemeFromConfig } from "."

type Primitive = string | number | boolean
export type CSSProperties = React.CSSProperties
export type CSSClasses = { [Key:string]: CSSProperties | CSSClasses }
export type CSSClassesValues = CSSProperties & Record<string, CSSClassesValues>// { [key:`${string}&${string}` | `@media ${string}`]: CSSProperties }
export type UserDefinedStyles = { "@global"?: CSSClasses } & CSSClasses
export type Color = CSSProperties["color"]
export type AtomsStruct = { [Key:string]: Primitive | AtomsStruct }
export type StateStruct = Record<string, Primitive>

type MergeConfigs<T, InheritedConfig, Field> = ObjectsDeepMerge<T, InheritedConfig extends undefined ? {} : ThemeFromConfig<InheritedConfig>[ Field ]> // Config extends undefined ? {} : Theme[Field]

export type ThemeConfig<
  State extends StateStruct,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
  // InheritedConfig extends ThemeConfig = ThemeConfig<StateStruct, AtomsStruct, UserDefinedStyles, UserDefinedStyles, UserDefinedStyles>
  InheritedConfig extends undefined | ThemeConfig<any, any, any, any, any> = undefined,
> = {
  inheritedConfig?: InheritedConfig
  state?: State
  // test?: (param:MergeConfigs<State, InheritedConfig, "state"> ) => void
  // test?: (param:InheritedConfig ) => void
  atoms?: (atomsData:{
    state: MergeConfigs<State, InheritedConfig, "state">
  }) => Atoms
  mixins?: (mixinsData:{
    state: MergeConfigs<State, InheritedConfig, "state">
    atoms: MergeConfigs<Atoms, InheritedConfig, "atoms">
  }) => Mixins
  components?: (componentsData:{
    state: MergeConfigs<State, InheritedConfig, "state">
    atoms: MergeConfigs<Atoms, InheritedConfig, "atoms">
    mixins: Mixins
  }) => Components
  onStateChange?: (state:MergeConfigs<State, InheritedConfig, "state">) => void
}

export type FullThemeConfig = ThemeConfig<any, any, any, any, ThemeConfig<any, any, any, any>>
export type JustThemeConfig = ThemeConfig<any, any, any, any>
export type AnyThemeConfig = JustThemeConfig | FullThemeConfig

export type Theme<
  State extends Record<string, Primitive>,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
> = {
  state: State
  atoms: Atoms
  mixins: Mixins
  components: Components
}

export type ThemeStateSetter<State extends Record<string, Primitive>> = (key:keyof State, value:State[typeof key]) => void
export type ThemeWithActions<
  State extends Record<string, Primitive>,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
> = Theme<State, Atoms, Mixins, Components> & {
  setState: ThemeStateSetter<State>
}
export type ThemeWithActionsFrom<Them extends null | Theme<any, any, any, any>> = Them extends Theme<infer S, infer A, infer M, infer C> ? ThemeWithActions<S, A, M, C> : null

export type UseStylesProps = Record<string, any>
export type StylesCreator<Them extends Theme<any>, ReturnedStyles extends UserDefinedStyles> = (theme:Them & {props: UseStylesProps}) => ReturnedStyles
