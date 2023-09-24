import { ReactNode } from "react"
import { cn, createStylesHook } from "../../../theming"
import { getPageSectionStyles } from "."

export type PageSectionDecorationsProps = {
  children: ReactNode
  className?: string
  columnWide?: boolean
}

export default function PageSectionDecorations({ children, className, columnWide }:PageSectionDecorationsProps) {
  const [ classes ] = useStyles()

  const body = columnWide
    ? <div>{children}</div>
    : children

  return (
    <div className={cn( classes.pageSectionDecorations, columnWide && classes.isColumnWide, className )}>
      {body}
    </div>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  pageSectionDecorations: {
    position: `absolute`,
    inset: 0,
    margin: 0,
    maxWidth: `unset`,
    overflow: `hidden`,
    zIndex: `0`,
  },
  isColumnWide: {
    "& > *": {
      position: `absolute`,
      inset: 0,
      ...getPageSectionStyles( components )[ `:where( & > *:not( img ) )` ],
    },
  },
}) )
