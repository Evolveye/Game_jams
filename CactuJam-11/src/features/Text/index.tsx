import { ReactNode } from "react"
import cn from "@lib/theming/createClassName"
import select from "@lib/core/functions/select"
import { createStylesHook } from "../theming"

export const textElements = {
  p: `p`,
  span: `span`, mark: `mark`, small: `small`, high: `high`,
  h1: `h1`, h2: `h2`, h3: `h3`, h4: `h4`, h5: `h5`, h6: `h6`,
} as const

export type TextElement = typeof textElements[keyof typeof textElements]

export type TextJustification = `left` | `center` | `right`
export type TextProps = {
  children?: ReactNode
  body?: ReactNode
  className?: string
  as?: TextElement
  looksLike?: TextElement
  justify?: TextJustification
  minLines?: number
}

export default function Text({ children, body, className, as = `p`, looksLike = as, justify, minLines }:TextProps) {
  children ||= body

  const [ classes ] = useStyles()

  const baseClassName = looksLike in classes ? classes[ looksLike ] : classes.p
  const justifyClassName = select( justify, {
    left: classes.isJustifiedLeft,
    center: classes.isJustifiedCenter,
    right: classes.isJustifiedRight,
  } )

  const As = select( as, {
    high: `p`,
    default: as,
  } ) as keyof JSX.IntrinsicElements

  return <As className={cn( baseClassName, justifyClassName, className )} style={!minLines ? undefined : { minHeight:`calc( var( --line-height ) * ${minLines})` }}>{children}</As>
}

export const useStyles = createStylesHook( ({ atoms }) => ({
  p: {
    "--line-height": `1.7em`,
    lineHeight: `var( --line-height )`,
    fontSize: atoms.sizes.font.regular,
    marginTop: atoms.spacing.main,
    marginBottom: atoms.spacing.main,
  },

  high: {
    "--line-height": `1.7em`,
    lineHeight: `var( --line-height )`,
    fontSize: atoms.sizes.font.high,
    marginTop: atoms.spacing.main,
    marginBottom: atoms.spacing.main,
  },

  h1: {
    "--line-height": `1.1em`,
    lineHeight: `var( --line-height )`,
    fontSize: `min( 56px, 8vw )`,
    fontWeight: `bold`,
    marginTop: atoms.spacing.main,
    marginBottom: atoms.spacing.main,
  },
  h2: {
    "--line-height": `1.3em`,
    lineHeight: `var( --line-height )`,
    fontSize: `min( 40px, 7.5vw )`,
    fontWeight: `bold`,
    marginTop: atoms.spacing.main,
    marginBottom: atoms.spacing.main,
  },
  h3: {
    "--line-height": `1.3em`,
    lineHeight: `var( --line-height )`,
    fontSize: `21px`,
    fontWeight: `bold`,
    marginTop: atoms.spacing.main,
    marginBottom: atoms.spacing.main,
  },

  isJustifiedLeft: {
    textAlign: `left`,
  },
  isJustifiedCenter: {
    textAlign: `center`,
  },
  isJustifiedRight: {
    textAlign: `right`,
  },
}) )
