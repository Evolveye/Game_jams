import { ReactNode } from "react"
import { ResponsivePropertyValue, updateResponsivePropertiesToStyle } from "@lib/core/flow/ResponsiveAreaNames"
import cn, { isOverrideableClassName } from "../functions/createClassName"
import { makeSpacing, makeStyleSpacingsInline, SpacingsSimpleValue, SpacingsValue } from "./makeStyleSpacings"
import classes from "./flow.module.css"

export type GridProps = {
  children: ReactNode
  className?: string | { override:string }
  style?: React.CSSProperties
  margin?: ResponsivePropertyValue<SpacingsValue>
  padding?: ResponsivePropertyValue<SpacingsValue>
  gap?: ResponsivePropertyValue<SpacingsSimpleValue>
  template: ResponsivePropertyValue<string>
}

export default function Grid({ children, className, style, template, margin, padding, gap }:GridProps) {
  const finalClassname = isOverrideableClassName( className ) ? className.override : cn( classes.grid, className )

  const finalStyle:React.CSSProperties = { ...style }
  updateResponsivePropertiesToStyle( finalStyle, `--template`, template )
  updateResponsivePropertiesToStyle( finalStyle, `gap`, gap, v => typeof v !== `object` && makeSpacing( v ) )
  updateResponsivePropertiesToStyle( finalStyle, `padding`, padding, makeStyleSpacingsInline, v => typeof v !== `object` && makeSpacing( v ) )
  updateResponsivePropertiesToStyle( finalStyle, `margin`, margin, makeStyleSpacingsInline, v => typeof v !== `object` && makeSpacing( v ) )

  return (
    <div className={finalClassname} style={finalStyle}>
      {children}
    </div>
  )
}
