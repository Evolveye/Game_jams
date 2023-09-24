import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createStylesHook, cn, CSSProperties } from "../../../theming"
import { SliderDataHookReturnValue } from "./useSliderData"

export type SliderProps = SliderDataHookReturnValue & {
  children: ReactNode
  className?: string
  maxVisibleCount: number
  noloop?: boolean
}

export default function Slider({ children, className, reachedEnds, maxVisibleCount, noloop, scroll, setReachedEnds, scrollableAreaRef, scrollableAreaGapRef }:SliderProps) {
  const [ classes ] = useStyles()
  const childArr = useMemo( () => React.Children.toArray( children ), [ children ] )
  const [ jump, setJump ] = useState<-1 | 0 | 1>(0)

  const lastItemRef = useRef<HTMLDivElement>( null )
  const firstItemRef = useRef<HTMLDivElement>( null )
  const scrollJumperRef = useRef<( () => void) | null>( null )

  scrollJumperRef.current = useCallback( () => {
    if (!jump) return

    scroll( childArr.length * jump, { smooth:false } )
    setJump( 0 )
  }, [ scroll, jump, childArr.length ] )

  useEffect( () => { // Init
    const scrollArea = scrollableAreaRef.current

    if (!scrollArea) return
    if (noloop) {
      const endsReached = reachedEnds.left && reachedEnds.right

      if (scrollArea.offsetWidth === scrollArea.scrollWidth && !endsReached) {
        setReachedEnds({ left:true, right:true })
      } else if (scrollArea.offsetWidth !== scrollArea.scrollWidth && endsReached) {
        setReachedEnds({ left:true, right:false })
      }

      return
    }

    const firstChild = scrollArea.children[ 0 ] as HTMLDivElement
    const secondChild = scrollArea.children[ 1 ] as HTMLDivElement

    scrollableAreaGapRef.current = (secondChild.offsetLeft - firstChild.offsetLeft) - secondChild.offsetWidth

    scroll( maxVisibleCount, { smooth:false, toIndex:true } )
  }, [ children, noloop, scroll, maxVisibleCount ] )

  useEffect( () => { // Intersection observer
    const lastItem = lastItemRef.current
    const firstItem = firstItemRef.current

    const cb = ([ entry ]:IntersectionObserverEntry[]) => {
      if (!entry?.isIntersecting) return

      if (entry.target === lastItem) setJump( -1 )
      else if (entry.target === firstItem) setJump( 1 )
    }

    const observer = new IntersectionObserver( cb )

    if (firstItem) observer.observe( firstItem )
    if (lastItem) observer.observe( lastItem )


    return () => observer.disconnect()
  }, [] )

  useEffect( () => { // Scrolling stop detector
    const scrollArea = scrollableAreaRef.current

    if (!scrollArea) return

    let scrollTimeout

    const handler = e => {
      const atSnappingPoint = e.target.scrollLeft % e.target.offsetWidth === 0
      const timeOut = atSnappingPoint ? 0 : 150

      clearTimeout( scrollTimeout )

      scrollTimeout = setTimeout( () => {
        scrollJumperRef.current?.()

        if (noloop) {
          if (scrollArea.scrollLeft === 0) setReachedEnds({ left:true, right:false })
          else if (scrollArea.scrollWidth - scrollArea.clientWidth === scrollArea.scrollLeft) setReachedEnds({ left:false, right:true })
          else setReachedEnds({ left:false, right:false })
        }
      }, timeOut )
    }

    scrollArea.addEventListener( `scroll`, handler )

    return () => {
      clearTimeout( scrollTimeout )
      scrollArea.removeEventListener( `scroll`, handler )
    }
  }, [ noloop ] )

  if (noloop) return (
    <div className={cn( classes.scrollingArea, classes.itemContainer, className )} ref={scrollableAreaRef}>
      {children}
    </div>
  )

  const extraPrev = (() => {
    let output:ReactNode[] = []

    for (let index = 0;  index < maxVisibleCount;  index++) {
      output.push( childArr[ childArr.length - 1 - index ] )
    }

    output.reverse()
    return output
  })()

  const extraNext = (() => {
    let output:ReactNode[] = []

    for (let index = 0;  index < maxVisibleCount;  index++) {
      output.push( childArr[ index ] )
    }

    return output
  })()

  return (
    <div ref={scrollableAreaRef} className={cn( classes.scrollingArea, classes.itemContainer, className )} style={{ "--count":maxVisibleCount } as CSSProperties}>
      <div ref={firstItemRef} className={classes.itemContainer}>
        {extraPrev[ 0 ]}
      </div>
      {extraPrev.slice( 1 )}

      {children}

      {extraNext.slice( 0, -1 )}
      <div ref={lastItemRef} className={classes.itemContainer}>
        {extraNext.slice( -1 )}
      </div>
    </div>
  )
}

const useStyles = createStylesHook({
  slider: {
    display: `flex`,
    // gap: atoms.spacing.main,
  },

  actionWrapper: {
    display: `flex`,
    alignItems: `center`,
  },

  scrollingArea: {
    flexGrow: 1,
    display: `flex`,
    // gap: atoms.spacing.main,
    overflowX: `scroll`,
    scrollSnapType: `x mandatory`,
    scrollSnapStop: `always`,

    '&::scrollbar': {
      display: `none`,
    },

    '&::-webkit-scrollbar': {
      display: `none`,
    },
  },
  itemContainer: {
    '& > *': {
      scrollSnapAlign: `center`,
      flexShrink: 0,
    },
  },
})
