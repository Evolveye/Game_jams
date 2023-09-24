import { useRef, useState, RefObject, MutableRefObject } from "react"

export type ScrollFn = (jump:number, ends?:{ smooth?: boolean; toIndex?: boolean }) => void
export type SliderEnds = { left: boolean; right: boolean }
export type SliderDataHookReturnValue = {
  scroll: ScrollFn
  setReachedEnds: (ends:SliderEnds) => void
  reachedEnds: SliderEnds
  scrollableAreaRef: RefObject<HTMLDivElement>
  scrollableAreaGapRef: MutableRefObject<number>
  maxVisibleCount: number
  noloop: boolean
}

export type SliderDataHookConfig = {
  maxVisibleCount?: number
  noloop?: boolean
}

export default function useSliderData( { maxVisibleCount = 4, noloop = false }:SliderDataHookConfig = {} ) {
  const [ reachedEnds, setReachedEnds ] = useState({ left:noloop, right:false })
  const scrollableAreaRef = useRef<HTMLDivElement>( null )
  const scrollableAreaGapRef = useRef( 0 )

  const scroll = (jump:number, { smooth = true, toIndex = false } = {}) => {
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
  }

  const ctxValue:SliderDataHookReturnValue = {
    scroll,
    setReachedEnds,
    reachedEnds,
    scrollableAreaRef,
    scrollableAreaGapRef,
    maxVisibleCount,
    noloop,
  }

  return ctxValue
}
