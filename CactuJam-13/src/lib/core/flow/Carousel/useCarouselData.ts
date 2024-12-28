import { useRef, useState, RefObject, MutableRefObject, useCallback } from "react"

export type ScrollFn = (jump:number, ends?:{ smooth?: boolean, toIndex?: boolean }) => void
export type CarouselEnds = { left: boolean, right: boolean }
export type CarouselDataHookReturnValue = {
  scroll: ScrollFn
  setReachedEnds: (ends:CarouselEnds) => void
  setScrollLeft: (scrollLeft:number) => void
  reachedEnds: CarouselEnds
  scrollLeft: null | number
  scrollableAreaRef: RefObject<HTMLDivElement>
  scrollableAreaGapRef: MutableRefObject<number>
  maxVisibleCount: number
  noloop: boolean
  gap?: number
}

export type CarouselDataHookConfig = {
  maxVisibleCount?: number
  noloop?: boolean
  gap?: number
}

export default function useCarouselData( { maxVisibleCount = 4, noloop = false, gap }:CarouselDataHookConfig = {} ) {
  const [ reachedEnds, setReachedEnds ] = useState({ left:noloop, right:false })
  const scrollableAreaRef = useRef<HTMLDivElement>( null )
  const [ scrollLeft, setScrollLeft ] = useState<null | number>( null )
  const scrollableAreaGapRef = useRef( 0 )

  const scroll = useCallback( (jump:number, { smooth = true, toIndex = false } = {}) => {
    const scrollArea = scrollableAreaRef.current
    if (!scrollArea) return

    const firstChild = scrollArea.children[ 0 ] as HTMLDivElement
    const scrollingFn = toIndex ? `scrollTo` : `scrollBy`
    const scrollLeft = (firstChild.offsetWidth + scrollableAreaGapRef.current) * jump

    scrollArea[ scrollingFn ]({
      left: scrollLeft,
      behavior: smooth ? `smooth` : `instant` as ScrollBehavior,
    })

    if (noloop) {
      if (scrollArea.scrollLeft === 0 && scrollLeft > 0) setReachedEnds({ left:false, right:false })
      else if (scrollArea.scrollWidth - scrollArea.clientWidth === scrollArea.scrollLeft && scrollLeft < 0) setReachedEnds({ left:false, right:false })
    }
  }, [ noloop ] )

  const setModuledScrollLeft = (scrollleft:number) => {
    const scrollableArea = scrollableAreaRef.current

    if (!scrollableArea) return

    const shiftedScrollLeft = scrollleft - (scrollableArea.firstElementChild?.scrollWidth ?? 0)
    const scrollLeftFromRealItems = shiftedScrollLeft >= 0 ? shiftedScrollLeft : scrollableArea.scrollWidth - shiftedScrollLeft
    const realItemsScrollableWidth = scrollableArea.scrollWidth - ((scrollableArea.firstElementChild?.scrollWidth ?? 0) + (scrollableArea.lastElementChild?.scrollWidth ?? 0))
    const scrollValue = scrollLeftFromRealItems % realItemsScrollableWidth
    // console.log({
    //   gap,
    //   scrollleft,
    //   scrollWidth: scrollableArea.firstElementChild?.scrollWidth,
    //   shiftedScrollLeft,
    //   scrollLeftFromRealItems,
    //   realItemsScrollableWidth,
    //   scrollValue,
    // })

    setScrollLeft( scrollValue )
  }

  const ctxValue:CarouselDataHookReturnValue = {
    scroll,
    setReachedEnds,
    setScrollLeft: setModuledScrollLeft,
    scrollableAreaRef,
    scrollLeft,
    reachedEnds,
    scrollableAreaGapRef,
    maxVisibleCount,
    noloop,
    gap,
  }

  return ctxValue
}
