import { cn, createStylesHook } from "../../theming"
import select from "../../core/functions/select"
import { IsomorphicContainerProps, Justification } from "./Container"

export type RowJustification = Justification | `space-between` | `space-evenly` | `centered-triple`
export type RowProps = Omit<IsomorphicContainerProps, "justify"> & {
  justify?: RowJustification
  wrapping?: boolean
  gap?: boolean | number
}

export default function Row({ children, className, style, justify, gap, wrapping }:RowProps) {
  const [ classes ] = useStyles()

  const fullClassName = cn(
    classes.row,
    wrapping && classes.isWrapping,
    gap === true && classes.isGapped,
    useRowJustification( justify ),
    className,
  )

  return (
    <div className={fullClassName} style={typeof gap === `number` ? { ...style, gap } : style}>
      {children}
    </div>
  )
}

export function useRowJustification( justify?:RowJustification ) {
  const [ classes ] = useStyles()

  return select( justify, {
    left: classes.isToLeft,
    center: classes.isToCenter,
    right: classes.isToRight,
    "space-between": classes.isJustifiedSpaceBetween,
    "space-evenly": classes.isJustifiedSpaceBetween,
    "centered-triple": classes.centeredTriple,
  } )
}

const useStyles = createStylesHook( ({ components }) => ({
  row: {
    display: `flex`,
    flexDirection: `row`,
    alignItems: `center`,

    ...components.Row,

    "& > *": {
      margin: 0,
    },

    "&$centeredTriple": {
      "& > :not( :nth-child( 2 ) )": {
        flexBasis: `0%`,
        flexGrow: 1,
      },

      "& > :nth-child( 3 )": {
        display: `flex`,
        justifyContent: `right`,
      },
    },
  },

  isToLeft: {
    justifyContent: `left`,
  },
  isToCenter: {
    justifyContent: `center`,
  },
  isToRight: {
    justifyContent: `right`,
  },
  isJustifiedSpaceBetween: {
    justifyContent: `space-between`,
  },
  isJustifiedSpaceEvenly: {
    justifyContent: `space-evenly`,
  },

  isWrapping: {
    flexWrap: `wrap`,
  },
  isGapped: {
    gap: `var( --gap, 1.5em )`,
  },

  centeredTriple: {},
}), `lib::Row` )
