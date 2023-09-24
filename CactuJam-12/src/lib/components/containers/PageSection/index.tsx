/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContainerProps } from "../Container"
import { getTextContainerStyles } from "../../typography/TextContainer"
import { cn, createStylesHook, CSSProperties } from "../../../theming"

export { default as PageSectionDecorations } from "./PageSectionDecorations"

export type PageSectionElement = `header` | `main` | `article` | `section` | `form` | `footer` | `aside` | `div`
export type PageSectionProps = ContainerProps & {
  as?: PageSectionElement
  selfStyled?: boolean
}

export default function PageSection({ children, as:As = `section`, className, selfStyled }:PageSectionProps) {
  const [ classes ] = useStyles()

  return (
    <As className={cn( selfStyled && classes.pageSection, className )}>
      {children}
    </As>
  )
}

export function getPageSectionStyles( components:Record<string, any> = {}, defaultSectionMaxWidth?:string | number ) {
  return {
    position: `relative`,
    width: `100%`,

    ...components.PageSection,
    ...getTextContainerStyles( components ),

    "& > :first-child": {
      marginTop: 0,

      ...components.PageSection?.[ `& > :first-child` ],
    },

    ":where( & > *:not( img ) )": { // This line is used in PageSectionDecorations component!
      marginLeft: `auto`,
      marginRight: `auto`,
      maxWidth: defaultSectionMaxWidth ? (typeof defaultSectionMaxWidth === `number` ? `${defaultSectionMaxWidth}px` : defaultSectionMaxWidth) : `var( --max-width )`,

      "a&": {
        display: `block`,
      },

      ...components.PageSection?.[ `& > *` ],
    },

    "& > :last-child": {
      marginBottom: 0,

      ...components.PageSection?.[ `& > :last-child` ],
    },
  }
}

export function getPageSectionParentStyles( components:Record<string, any> = {}, defaultSectionMaxWidth?:string | number ) {
  return {
    "& > *": getPageSectionStyles( components, defaultSectionMaxWidth ) as unknown as Record<string, CSSProperties>,
  }
}

const useStyles = createStylesHook( ({ components }) => ({
  pageSection: getPageSectionStyles( components ) as unknown as Record<string, CSSProperties>,

  // ...Object.entries( components.Section )
  //   .filter( ([ k ]) => /--variant-\w+/.test( k ) )
  //   .reduce( (classNames, [ variable, colors ]) => ({ ...classNames, [ `is${variable.match( /--variant-(\w+)/ )![ 1 ]}` ]:colors }), {} ),
}), `lib::PageSection` )
