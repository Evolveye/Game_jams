import { ReactNode } from "react"
import { CSSClassesValues } from "@lib/theming/types"
import { cn, createStylesHook, CSSProperties } from "../../theming"
import { blockTextElements, getTextTagsStyles, inlineTextElements, textElements } from "."

export type TextContainerProps = {
  className?: string
  style?: CSSProperties
  children: ReactNode
  as?: keyof JSX.IntrinsicElements
}

export default function TextContainer({ className, style, children, as:As = `div` }:TextContainerProps) {
  const [ classes ] = useTextContainerStyles()

  return <As className={cn( classes.textContainer, className )} style={style}>{children}</As>
}

export function getTextContainerStyles( components:Record<string, CSSClassesValues> = {} ) {
  return {
    "& > :first-child": {
      marginTop: 0,
    },

    "& > :last-child": {
      marginBottom: 0,
    },

    ...Object.fromEntries( Object.entries( getTextTagsStyles( components ) )
      .filter( ([ k ]) => k in textElements )
      .map( ([ selector, v ]) => {
        if (selector in blockTextElements) {
          return [ `:where( & > ${selector} )`, v ]
        }

        const complexSelector = `& > ${selector}, ` + Object.values( blockTextElements ).map( ele => `& > ${ele} ${selector}` ).join()

        return [ complexSelector, v ]
      } ),
    ),
  } as CSSProperties
}

const inlineTagsSelector = Object.keys( inlineTextElements ).join( `, ` )

export const textContainerGlobalClass = `text-container`

export const useTextContainerStyles = createStylesHook( ({ components }) => {
  console.log( inlineTagsSelector )

  // const selector = `:where(\n  &\u002c\n  & > *:where( div )\u002c\n  S > *:where( div ) *\n) > :where( span\u002c b )`
  // const selector = ``
  //   + `:where(\n`
  //   + `  &\u002c\n`
  //   + `  & > *:where( div )\u002c\n`
  //   + `  S > *:where( div ) *\n`
  //   + `) > :where( span\u002c b )`
  // + `) > :where( ${inlineTagsSelector} )`

  const styles = {
    "& > :first-child": {
      marginTop: 0,
    },

    "& > :last-child": {
      marginBottom: 0,
    },

    [ `:where(\n & > *:where( div ),\n & > *:where( div ) *) > :where( , )` ]: {
      backgroundColor: `#bb0000`,
    },
  }

  return {
    "@global": {
      [ `.${textContainerGlobalClass}` ]: styles,
    },
    textContainer: styles,
  }
}, `lib::TextContainer` )
