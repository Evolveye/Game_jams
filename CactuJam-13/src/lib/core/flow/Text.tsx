export const blockTextElements = {
  p: `p`, figcaption: `figcaption`,
  h1: `h1`, h2: `h2`, h3: `h3`, h4: `h4`, h5: `h5`, h6: `h6`,
} as const

export const inlineTextElements = {
  span: `span`, b: `b`,
  small: `small`, mark: `mark`, strong: `strong`, em: `em`,
} as const

export const textElements = { ...blockTextElements, ...inlineTextElements }
export type TextElement = keyof typeof textElements

export type TextAlign = `left` | `center` | `right` | `justify`
export type TextProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  id?: string
  as?: TextElement
  align?: TextAlign
  minLines?: number
}

export default function Text({ children, className, id, style = {}, as:As = `p`, align, minLines }:TextProps) {
  if (align) style.textAlign = align
  if (minLines) style.minHeight = `calc( var( --line-height, 1em ) * ${minLines})`

  return (
    <As
      className={className}
      id={id}
      style={!minLines ? style : { minHeight:`calc( var( --line-height ) * ${minLines})`, ...style }}
    >
      {children}
    </As>
  )
}
