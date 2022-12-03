import { ReactNode } from "react"
import cn from "@lib/theming/createClassName"
import { createStylesHook } from "@fet/theming"

export type SpanProps = {
  className?: string
  children?: ReactNode
  body?: ReactNode
  highlight?: boolean
}

export default function Span({ className, children, body, highlight }:SpanProps) {
  children ||= body

  const [ classes ] = useStyles()

  const fullClassName = cn(
    highlight && classes.isHighlighted,
    className,
  )

  return (
    <span className={fullClassName}>{children}</span>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  isHighlighted: {
    color: atoms.colors.primary.main,
  },
}) )
