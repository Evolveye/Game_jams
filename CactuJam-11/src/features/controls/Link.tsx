import { ReactNode, CSSProperties } from "react"
import { Link as GatsbyLink } from "gatsby"
import cn from "@lib/theming/createClassName"
import { createStylesHook } from "@fet/theming"

export type LinkProps = {
  to: string
  className?: string
  body?: ReactNode
  children?: ReactNode
  style?: CSSProperties
}

export default function Link({ children, body, className, to, style }:LinkProps) {
  children ||= body

  const [ classes ] = useStyles()

  return <GatsbyLink className={cn( classes.link, className )} style={style} to={to}>{children}</GatsbyLink>
}

const useStyles = createStylesHook( ({ atoms }) => ({
  link: {
    color: atoms.colors.rest.green,
    cursor: `pointer`,
  },
}) )
