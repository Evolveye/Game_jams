import { ReactNode } from "react"
import { cn, createStylesHook } from "../../../theming"
import { getTextContainerStyles } from "../../../components/typography/TextContainer"

export type PageSectionContentProps = {
  children: ReactNode
  className?: string
}

export default function PageSectionContent({ children, className }:PageSectionContentProps) {
  const [ classes ] = useStyles()

  return (
    <div className={cn( classes.pageSectionContent, className )}>
      {children}
    </div>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  pageSectionContent: {
    position: `relative`,
    zIndex: 1,
    ...getTextContainerStyles( components ),
    ...components.PageSectionContext,
  },
}) )
