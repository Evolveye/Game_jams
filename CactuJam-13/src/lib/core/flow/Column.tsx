import cn from "../functions/createClassName"
import { HorizontalAlign, VerticallAlign, checkIsTextHorizontalAlign } from "./utils"
import classes from "./flow.module.css"
import Row from "./Row"

export type ColumnProps = {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  verticallAlign?: VerticallAlign
  align?: HorizontalAlign
  compact?: boolean
  narrow?: boolean
  width?: number | string
}

export default function Column({ className, style, children, verticallAlign = `top`, align, width }:ColumnProps) {
  const widthStyle:React.CSSProperties = {}
  const isVerticallyDefaultAlignement = verticallAlign === `top`

  if (width) {
    widthStyle[ `--width` as `width` ] = typeof width === `number` ? `min( ${width}px, 100% )` : `min( ${width}, 100% )`
    widthStyle.flex = `0 0 auto`
  }

  const bodyStyle = isVerticallyDefaultAlignement ? { ...widthStyle, ...style } : style
  let body

  if (checkIsTextHorizontalAlign( align )) {
    const bodyClassName = cn(
      align === `right` && classes.isAligningRight,
      align === `left` && classes.isAligningLeft,
      align === `center` && classes.isAligningCenter,
      className,
    )

    body = <div className={bodyClassName} style={bodyStyle}>{children}</div>
  } else {
    body = <Row className={className} style={bodyStyle} align={align}>{children}</Row>
  }

  if (isVerticallyDefaultAlignement) return body
  return <div className={classes.verticallyAlignedColumn} style={{ ...widthStyle, justifyContent:verticallAlign }}>{body}</div>
}
