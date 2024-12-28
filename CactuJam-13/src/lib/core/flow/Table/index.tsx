import { ReactNode } from "react"
import cn from "../../functions/createClassName"
import classes from "./table.module.css"

export type TableProps = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  heads?: string[]
}

export { default as TData } from "./TData"

export default function Table({ children, className, style, heads }:TableProps) {
  return (
    <table className={cn( classes.table, className )} style={style}>
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
