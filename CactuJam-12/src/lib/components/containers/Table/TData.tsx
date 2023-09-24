import { ReactNode } from "react"
import { cn, createStylesHook, CSSProperties } from "@lib/theming"
import { getContainerJustification, Justification, useContainerStyles } from "../Container"

export type TDataProps = {
  children: ReactNode
  className?: string
  width?: number
  justify?: Justification
}

export default function TData({ children, className, width, justify }:TDataProps) {
  const [ containerClasses ] = useContainerStyles()
  const [ classes ] = useStyles()

  const fullClassName = cn(
    classes.td,
    getContainerJustification( justify, containerClasses ),
    className,
  )

  const style = {} as CSSProperties
  if (width) style[ `--width` ] = `${width}px`

  return (
    <td className={fullClassName} style={Object.keys( style ).length === 0 ? undefined : style}>
      {children}
    </td>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  td: {
    width: `var( --width )`,

    ...components.Table_Td,
  },
}), `lib::TData` )
