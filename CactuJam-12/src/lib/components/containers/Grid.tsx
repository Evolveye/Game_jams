import { ReactNode } from "react"
import { CSSProperties, cn, createStylesHook } from "../../theming"
import { ContainerBreakpoints, containerStylesBreakpointsVars } from "./Container"

export type GridProps = {
  children: ReactNode
  className?: string
  template: ContainerBreakpoints
}

export default function Grid({ children, className, template }:GridProps) {
  const [ classes ] = useStyles()

  if (typeof template == `string`) template = { m:template }

  const style = {} as CSSProperties
  if (template.s)  style[ `--s`  ] = template.s
  if (template.xs) style[ `--xs` ] = template.xs
  if (template.m)  style[ `--m`  ] = template.m
  if (template.l)  style[ `--l`  ] = template.l
  if (template.xl) style[ `--xl` ] = template.xl

  return (
    <div className={cn( classes.grid, className )} style={style}>
      {children}
    </div>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  grid: {
    display: `grid`,

    "& > div": {
      margin: 0,
    },

    ...components.Grid,
    ...Object.fromEntries( !components.Container ? [] : Object.entries( components.Container )
      .filter( ([ k ]) => (containerStylesBreakpointsVars as string[]).includes( k ) )
      .map( ([ k, v ]) => [
        v,
        {
          gridTemplate: `var( ${k}, var( --m ) )`,
        },
      ] ),
    ),
  },
}), `lib::Grid` )
