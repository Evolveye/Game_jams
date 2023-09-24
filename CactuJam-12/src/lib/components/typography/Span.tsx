import { ReactNode } from "react"
import cn from "@lib/theming/createClassName"
import { createStylesHook } from "@fet/theming"

export const spanElements = {
  span: `span`,
  small: `small`,
  mark: `mark`,
} as const

export type SpanElement = keyof typeof spanElements

export type SpanProps = {
  children?: ReactNode
  body?: ReactNode
  className?: string
  as?: SpanElement
  highlight?: boolean
  underline?: boolean
  fade?: boolean
}

export default function Span({ children, body, className, as:As = `span`, underline, highlight, fade }:SpanProps) {
  children ||= body

  const [ classes ] = useStyles()

  const fullClassName = cn(
    fade && classes.isFade,
    highlight && classes.isHighlighted,
    underline && classes.isUnderlined,
    className,
  )

  return (
    <As className={fullClassName}>{children}</As>
  )
}

const useStyles = createStylesHook({
  isHighlighted: {
    // color: atoms.colors.primary.text,
  },
  isFade: {
    color: `#888`,
  },
  isUnderlined: {
    position: `relative`,
    // textDecoration: `underline`,

    "&::after": {
      content: `""`,
      position: `absolute`,
      left: 0,
      right: 0,
      top: `100%`,
      height: `0.2em`,
      // backgroundColor: atoms.colors.primary.main,
    },
  },
})
