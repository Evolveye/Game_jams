import { ReactNode } from "react"
import { CSSClassesValues, CSSProperties, CSSClasses } from "../../theming/types"
import createStylesHook from "../../theming/createStylesHook"
import cn from "../../theming/createClassName"
import select from "../../core/functions/select"

export const blockTextElements = {
  p: `p`, figcaption: `figcaption`,
  h1: `h1`, h2: `h2`, h3: `h3`, h4: `h4`, h5: `h5`, h6: `h6`,
} as const

export const inlineTextElements = {
  span: `span`, b: `b`,
  small: `small`, mark: `mark`, strong: `strong`, em: `em`,
} as const

export const textElements = { ...blockTextElements, ...inlineTextElements }
export const textLooks = { ...textElements, large:`large` } as const

export type TextElement = keyof typeof textElements
export type TextLook = keyof typeof textLooks

export type TextJustification = `left` | `center` | `right`
export type TextProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  withoutMargin?: boolean
  as?: TextElement
  looksLike?: TextLook
  justify?: TextJustification
  minLines?: number
  type?: string
}

export default function Text({ children, className, style, as = `p`, looksLike, type, justify, minLines }:TextProps) {
  style ??= {}

  const baseClassName = useTextLooksLikeClassName( looksLike )

  if (justify === `center`) style.textAlign = `center`
  else if (justify === `right`) style.textAlign = `right`

  if (minLines) style.minHeight = `calc( var( --line-height ) * ${minLines})`

  const As = blockTextElements[ as as keyof typeof blockTextElements ] ?? as

  return (
    <As
      className={cn( baseClassName, type && `is-${type}`, className )}
      style={style}
    >
      {children}
    </As>
  )
}

export function useTextLooksLikeClassName( looksLike?:TextLook ) {
  const [ classes ] = useStyles()
  const baseClassName = !looksLike ? undefined : classes[ looksLike as keyof typeof classes ] ?? (looksLike in inlineTextElements ? classes.span : classes.p)

  return baseClassName
}

export function getTextTagsStyles( components:Record<string, CSSClassesValues> ) {
  return {
    ...Object.fromEntries( Object.entries( components )
      .filter( ([ k ]) => k.startsWith( `Typography_` ) )
      .map( ([ k, v ]) => [ k.slice( 11 ).toLowerCase(), v ] ),
    ),

    span: {
      ...components.Typography,
      ...components.Typography_Span,
    },
    small: {
      ...components.Typography,
      ...components.Typography_Small,
    },
    b: {
      ...components.Typography,
      ...components.Typography_B,
    },
    strong: {
      ...components.Typography,
      ...components.Typography_Strong,
    },
    p: {
      "--line-height": `1.7em`,
      lineHeight: `var( --line-height )`,
      ...components.Typography,
      ...components.Typography_P,
    },
    large: {
      "--line-height": `1.7em`,
      lineHeight: `var( --line-height )`,
      fontSize: `1.3em`,
      ...components.Typography,
      ...components.Typography_P_Large,
    },

    h1: {
      "--line-height": `1.1em`,
      lineHeight: `var( --line-height )`,
      fontWeight: `bold`,
      ...components.Typography,
      ...components.Typography_H1,
    },
    h2: {
      "--line-height": `1.3em`,
      lineHeight: `var( --line-height )`,
      fontWeight: 900,
      ...components.Typography,
      ...components.Typography_H2,
    },
    h3: {
      "--line-height": `1.3em`,
      lineHeight: `var( --line-height )`,
      fontWeight: `bold`,
      ...components.Typography,
      ...components.Typography_H3,
    },
    h4: {
      "--line-height": `1.3em`,
      lineHeight: `var( --line-height )`,
      fontWeight: `bold`,
      ...components.Typography,
      ...components.Typography_H4,
      backgroundColor: `yellow`,
    },
    h5: {
      "--line-height": `1.3em`,
      lineHeight: `var( --line-height )`,
      fontWeight: `bold`,
      ...components.Typography,
      ...components.Typography_H5,
      backgroundColor: `red`,
    },
    h6: {
      "--line-height": `1.3em`,
      lineHeight: `var( --line-height )`,
      fontWeight: `bold`,
      ...components.Typography,
      ...components.Typography_H6,
      backgroundColor: `green`,
    },
  } as CSSClasses
}

export const useStyles = createStylesHook( ({ components }) => ({ ...getTextTagsStyles( components ) }), `lib::Text` )
