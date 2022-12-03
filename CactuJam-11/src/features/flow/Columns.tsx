import { ReactNode } from "react"
import cn from "@lib/theming/createClassName"
import { createStylesHook } from "@fet/theming"

export type ColumnsProps = {
  className?: string
  children: ReactNode
}

export default function Columns({ className, children }:ColumnsProps) {
  const [ classes ] = useStyles()

  return (
    <div className={cn( classes.columns, className )}>
      {children}
    </div>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  columns: {
    display: `flex`,
    flexDirection: `row`,
    justifyContent: `center`,
    flexWrap: `wrap`,
    gap: atoms.spacing.main,

    "& > *": {
      flexGrow: 1,
      flexBasis: 0,
    },
  },
}) )
