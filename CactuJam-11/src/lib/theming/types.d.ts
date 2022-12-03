import React from "react"

type Primitive = string | number | boolean
export type CSSProperties = React.CSSProperties
export type Classes = { [Key:string]: CSSProperties | Classes }
export type UserDefinedStyles = { "@global"?: Classes } & Classes
export type Color = CSSProperties["color"]
export type AtomsStruct = { [Key:string]: Primitive | AtomsStruct }

export type ThemeConfig<
  State extends Record<string, Primitive>,
  Atoms extends AtomsStruct,
  Mixins extends UserDefinedStyles,
  Components extends UserDefinedStyles,
> = {
  state?: State
  atoms?: (atomsData:{state: State}) => Atoms
  mixins?: (mixinsData:{state: State; atoms: Atoms}) => Mixins
  components?: (componentsData:{state: State; atoms: Atoms; mixins: Mixins}) => Components
  onStateChange?: (state:State) => void
}

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
