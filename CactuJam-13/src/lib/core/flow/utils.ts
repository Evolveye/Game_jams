/*\
|*| Horizontal justification
\*/

const textHorizontalJAlign = [ `left`, `center`, `right` ] as const
const flexHorizontalAlign = [ `space-between`, `space-evenly` ] as const
const customHorizontalAlign = [ `stretch` ] as const

export type TextHorizontalAlign = typeof textHorizontalJAlign[ number ]
export type FlexHorizontalAlign = typeof flexHorizontalAlign[ number ]
export type CustomHorizontalAlign = typeof customHorizontalAlign[ number ]
export type HorizontalAlign = TextHorizontalAlign | FlexHorizontalAlign | CustomHorizontalAlign

export function checkIsTextHorizontalAlign( align:undefined | HorizontalAlign ): align is undefined | TextHorizontalAlign {
  return !align || (textHorizontalJAlign as readonly string[]).includes( align )
}

export function checkIsCustomHorizontalAlign( align:undefined | HorizontalAlign ): align is CustomHorizontalAlign {
  return !!align && (customHorizontalAlign as readonly string[]).includes( align )
}



/*\
|*| Vertical aligning
\*/

export type VerticallAlign = `top` | `center` | `bottom`



/*\
|*| Uncategorized
\*/

export function getGap( gap:undefined | string | boolean | number ) {
  return typeof gap === `number` ? `calc( var( --gap ) * ${gap} )`
    : typeof gap === `string` ? gap
      : gap === true ? `var( --gap )`
        : undefined
}
