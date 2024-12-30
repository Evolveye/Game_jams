/* eslint-disable @typescript-eslint/no-explicit-any */

import cn from "../functions/createClassName"
import { HorizontalAlign, VerticallAlign, checkIsCustomHorizontalAlign, getGap } from "./utils"
import classes from "./flow.module.css"

type ContainerProps = {
  as?: keyof JSX.IntrinsicElements
  children: React.ReactNode
  className?: string | { override:undefined | string }
  style?: React.CSSProperties
}

export type RowProps = ContainerProps & {
  align?: HorizontalAlign
  verticallAlign?: VerticallAlign
  wrap?: boolean
  gap?: string | boolean | number
}

export default function Row({ as:As = `div`, className, style, children, align, verticallAlign, gap, wrap }:RowProps) {
  const isCustomAligning = checkIsCustomHorizontalAlign( align )
  const finalClassName = typeof className === `object`
    ? cn( className.override )
    : cn( isCustomAligning ? classes.stretchedRow : classes.row, className )

  const finalStyle:React.CSSProperties = {
    ...style,
    gap: getGap( gap ),
    flexWrap: wrap === true ? `wrap`
      : wrap === false ? undefined
        : style?.flexWrap,
  }

  if (align && !isCustomAligning) finalStyle.justifyContent = align
  if (verticallAlign) finalStyle.alignItems = verticallAlign

  return (
    <As className={finalClassName} style={finalStyle}>
      {children}
    </As>
  )
}
