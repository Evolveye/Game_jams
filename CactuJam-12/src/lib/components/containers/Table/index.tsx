import { ReactNode } from "react"
import { cn, createStylesHook } from "@lib/theming"
export type TableProps = {
  children: ReactNode
  className?: string
  heads?: string[]
}

export { default as TData } from "./TData"

export default function Table({ children, className, heads }:TableProps) {
  const [ classes ] = useStyles()

  return (
    <table className={cn( classes.table, className )}>
      {
        heads && (
          <thead>
            <tr>
              {heads.map( label => <th key={label}>{label}</th> )}
            </tr>
          </thead>
        )
      }

      {children}
    </table>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  table: {
    width: `100%`,

    ...components.Table,

    "& tr": {
      ...components.Table_Tr,
    },

    "& th": {
      ...components.Table_Th,
    },

    "& td": {
      ...components.Table_Td,
    },
  },
}), `lib::Table` )
