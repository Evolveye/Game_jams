import { ReactNode } from "react"
import cn from "@lib/theming/createClassName"
import select from "@lib/core/functions/select"
import { createStylesHook } from "@fet/theming"

export type Justification = `left` | `center` | `right` | `space-between`
export type RowProps = {
  className?: string
  children: ReactNode
  justify?: Justification
  spaced?: boolean
  wrapping?: boolean
}

export default function Row({ className, children, justify, spaced, wrapping }:RowProps) {
  const [ classes ] = useRowStyles()
  const justifyClassName = select( justify, {
    left: classes.isJustifiedLeft,
    center: classes.isJustifiedCenter,
    right: classes.isJustifiedRight,
    "space-between": classes.isJustifiedSpaceBetween,
  } )

  const fullClassName = cn(
    classes.row,
    spaced && classes.isSpaced,
    wrapping && classes.isWrapping,
    justifyClassName,
    className,
  )

  return (
    <div className={fullClassName}>
      {children}
    </div>
  )
}

export const useRowStyles = createStylesHook( ({ atoms }) => ({
  row: {
    display: `flex`,
    flexDirection: `row`,
    alignItems: `center`,

    "& > *": {
      margin: 0,
    },
  },

  isJustifiedLeft: {
    justifyContent: `left`,
  },
  isJustifiedCenter: {
    justifyContent: `center`,
  },
  isJustifiedRight: {
    justifyContent: `right`,
  },
  isJustifiedSpaceBetween: {
    justifyContent: `space-between`,
  },

  isSpaced: {
    gap: atoms.spacing.main,
  },

  isWrapping: {
    flexWrap: `wrap`,
  },
}) )
