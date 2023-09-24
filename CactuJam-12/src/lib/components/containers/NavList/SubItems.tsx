import { ReactNode } from "react"
import { cn } from "@lib/theming"
import { createStylesHook } from "@fet/theming"

export type SubItemsProps = {
  children: ReactNode
  className?: string
}

export default function SubItems({ children, className }:SubItemsProps) {
  const [ classes ] = useStyles()

  return (
    <div className={cn( classes.subItems, className )}>
      <ol>
        {children}
      </ol>
    </div>
  )
}

const useStyles = createStylesHook({
  subItems: {
    position: `absolute`,

    "li:not( :hover ) > &": {
      display: `none`,
    },

    ":where( & li > a ), :where( & li > button )": {
      display: `block`,
      width: `100%`,
    },

    "& > ol": {
      margin: 0,
      padding: 0,
      width: `max-content`,
      listStyle: `none`,
    },
  },
})
