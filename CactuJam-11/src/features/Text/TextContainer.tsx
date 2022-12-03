import { ReactNode } from "react"
import { CSSProperties } from "@lib/theming/types"
import cn from "@lib/theming/createClassName"
import { createStylesHook } from "@fet/theming"

export type TextContainerProps = {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export default function TextContainer({ className, style, children }:TextContainerProps) {
  const [ classes ] = useTextContainerStyles()

  return <div className={cn( classes.textContainer, className )} style={style}>{children}</div>
}

export const useTextContainerStyles = createStylesHook( ({ atoms }) => ({
  textContainer: {
    "& > :first-child": {
      marginTop: 0,
    },
    "& > :last-child": {
      marginBottom: 0,
    },
    "& > *": {
      marginBottom: atoms.spacing.main,
    },
  },
}) )
