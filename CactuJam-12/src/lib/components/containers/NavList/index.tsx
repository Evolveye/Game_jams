import { ReactNode } from "react"
import { cn } from "@lib/theming"
import { createStylesHook } from "@fet/theming"

export { default as SubItems } from "./SubItems"
export { default as NavItem } from "./NavItem"

export type NavListProps = {
  children: ReactNode
  className?: string
  itemsClassName?: string
}

export default function NavList({ children, className, itemsClassName }:NavListProps) {
  const [ classes ] = useStyles()

  return (
    <nav className={cn( classes.nav, className )}>
      <ol className={itemsClassName}>
        {children}
      </ol>
    </nav>
  )
}

const useStyles = createStylesHook({
  nav: {
    "& > ol": {
      display: `flex`,
      alignItems: `center`,
      listStyle: `none`,
      margin: 0,
      padding: 0,

      "& li": {
        position: `relative`,
      },
    },
  },
})
