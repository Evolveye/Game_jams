import { ReactNode } from "react"
import { createStylesHook, CSSProperties } from "../../theming"
import select from "../../core/functions/select"


// Justification below

type TagProps<T extends Tagname> =
  | T extends `form` ? { onSubmit: () => void }
    : {}

export type Tagname = keyof JSX.IntrinsicElements
export type Justification = `left` | `center` | `right`


// Breakpoints below

const containerStylesBreakpointsKeys = [ `xl`, `l`, `m`, `s`, `xs` ] as const
type ContainerStylesBreakpointsKeys = typeof containerStylesBreakpointsKeys[number]

export const containerStylesBreakpointsVars = containerStylesBreakpointsKeys.map( k => `--${k}` ) as `--${ContainerStylesBreakpointsKeys}`[]
export type ContainerBreakpoints = string | Partial<Record<ContainerStylesBreakpointsKeys, string>>


// Component data and atomic types below

export type ContainerProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  justify?: Justification
}

export type IsomorphicContainerProps<Ele extends Tagname = Tagname> = TagProps<Ele> & ContainerProps & {
  as?: Ele
}

export const useContainerStyles = createStylesHook( ({
  isToLeft: {
    textAlign: `left`,
  },
  isToCenter: {
    textAlign: `center`,
  },
  isToRight: {
    textAlign: `right`,
  },
}), `lib::Container` )

export function getContainerJustification( justify:false | undefined | Justification, containerClasses:Record<string, string> ) {
  if (typeof justify != `string`) return

  return select( justify, {
    left: containerClasses.isToLeft,
    center: containerClasses.isToCenter,
    right: containerClasses.isToRight,
  } )
}
