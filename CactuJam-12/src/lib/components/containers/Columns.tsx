import { cn, createStylesHook } from "../../theming"
import { RowJustification, useRowJustification } from "./Row"
import { IsomorphicContainerProps } from "./Container"

export { default as Column } from "./Column"
export * from "./Column"

export type ColumnsProps = Omit<IsomorphicContainerProps, "justify"> & {
  gap?: boolean | number
  justify?: RowJustification
}

export default function Columns({ children, className, style, gap, as:As = `div`, justify = `center` }:ColumnsProps) {
  const [ classes ] = useStyles()
  const justifyClassName = useRowJustification( justify )

  return (
    <As className={cn( classes.columns, gap === true && classes.isGapped, justifyClassName, className )} style={typeof gap === `number` ? { ...style, gap } : style}>
      {children}
    </As>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  columns: {
    display: `flex`,
    flexDirection: `row`,
    flexWrap: `wrap`,
    gap: `var( --gap, 1em )`,

    ...components.Columns,
  },

  isGapped: {
    gap: `var( --gap, 1.5em )`,
  },
}), `lib::Columns` )
