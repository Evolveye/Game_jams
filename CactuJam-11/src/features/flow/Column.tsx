import { ReactNode, CSSProperties } from "react"
import cn from "@lib/theming/createClassName"
import select from "@lib/core/functions/select"
import { createStylesHook } from "@fet/theming"
import TextContainer from "@fet/Text/TextContainer"
import { Justification } from "./Row"

export type VerticallJustification = `top` | `center` | `bottom`
export type ColumnProps = {
  className?: string
  style?: CSSProperties
  children: ReactNode
  verticallJustify?: VerticallJustification
  justify?: Justification
  narrow?: boolean
  width?: string
}

export default function Column({ className, style, children, verticallJustify, width, narrow }:ColumnProps) {
  const [ classes ] = useStyles()

  const normalTextContainer = !verticallJustify || verticallJustify == `top`
  const verticallJustifyClassName = select( verticallJustify, {
    top: classes.isVerticallyJustifiedTop,
    center: classes.isVerticallyJustifiedCenter,
    bottom: classes.isVerticallyJustifiedBottom,
  } )

  const fullClassname = cn(
    classes.column,
    narrow && classes.isNarrow,
    width && classes.withWidth,
    verticallJustifyClassName,
    className,
  )

  if (width) {
    style ||= {}

    if (/^\d+%$/.test( width )) style.flexGrow = Number( width.match( /\d+/ )![ 0 ] ) / 100
    else style.flexBasis = width
  }

  if (normalTextContainer) return (
    <TextContainer className={fullClassname} style={style}>
      {children}
    </TextContainer>
  )

  return (
    <div className={fullClassname} style={style}>
      <TextContainer>
        {children}
      </TextContainer>
    </div>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  column: {
    display: `block`,

    [ atoms.breakpoints.bigMobile.mediaQueryMax ]: {
      flexBasis: `100%`,
    },
  },

  isVerticallyJustifiedTop: {
    display: `flex`,
    alignItems: `start`,
  },
  isVerticallyJustifiedCenter: {
    display: `flex`,
    alignItems: `center`,
  },
  isVerticallyJustifiedBottom: {
    display: `flex`,
    alignItems: `end`,
  },

  isNarrow: {
    width: `max-content`,
    flexGrow: 0,
    flexBasis: `auto`,
  },

  withWidth: {
    flexGrow: 0,

    [ atoms.breakpoints.bigMobile.mediaQueryMax ]: {
      flexGrow: 1,
    },
  },
}) )
