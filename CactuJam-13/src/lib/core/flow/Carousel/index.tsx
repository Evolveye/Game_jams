import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from "react"
import cn from "../../functions/createClassName"
import { CarouselDataHookReturnValue } from "./useCarouselData"
import classes from "./Carousel.module.css"

export type CarouselProps = CarouselDataHookReturnValue & {
  children: React.ReactNode
  className?: string | {override: string}
  maxVisibleCount: number
  noloop?: boolean
}

const Stage = {
  SETUP: `SETUP`,
  WAITING: `WAITING`,
  CAN_JUMP: `CAN_JUMP`,
  JUMPING: `JUMPING`,
} as const

export default function Carousel({ children, className, reachedEnds, maxVisibleCount, noloop, scroll, setReachedEnds, setScrollLeft, scrollableAreaRef, scrollableAreaGapRef, gap }:CarouselProps) {
  const childArr = useMemo( () => React.Children.toArray( children ), [ children ] )

  const lastItemRef = useRef<HTMLDivElement>( null )
  const firstItemRef = useRef<HTMLDivElement>( null )
  const scrollJumperRef = useRef<( (jump?:`start` | `end` | number) => void) | null>( null )
  const borderIntersections = useRef({ start:false, end:false, counter:0 })
  const stageRef = useRef<keyof typeof Stage>( Stage.WAITING )

  scrollJumperRef.current = useCallback<NonNullable<typeof scrollJumperRef.current>>( jump => {
    if (jump === undefined) return

    const finalJumpDir = typeof jump === `number` ? jump : jump === `start` ? 1 : -1

    setTimeout( () => {
      scroll( childArr.length * finalJumpDir, { smooth:false } )
      if (jump === `start`) borderIntersections.current.start = false
      else if (jump === `end`) borderIntersections.current.end = false
    }, 200 )
  }, [ scroll, childArr.length ] )

  useEffect( () => { // Init, set first card
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
    stageRef.current = Stage.SETUP

    scroll( maxVisibleCount, { smooth:false, toIndex:true } )
  }, [ children, noloop, scroll, maxVisibleCount ] ) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect( () => { // Intersection observer
    const lastItem = lastItemRef.current
    const firstItem = firstItemRef.current

    const cb = (entries:IntersectionObserverEntry[]) => {
      if (stageRef.current === Stage.SETUP) return
      stageRef.current = Stage.WAITING

      entries.forEach( entry => {
        if (entry.intersectionRatio !== 0 && entry.intersectionRatio < 0.001) return
        else if (entry.target === lastItem) borderIntersections.current.end = entry?.isIntersecting
        else if (entry.target === firstItem) borderIntersections.current.start = entry?.isIntersecting
      } )

      borderIntersections.current.counter++
    }

    const observer = new IntersectionObserver( cb, {
      rootMargin: `-1%`,
      threshold: Array.from( { length:1000 }, (_, i) => i / 1000 ),
    } )

    if (firstItem) observer.observe( firstItem )
    if (lastItem) observer.observe( lastItem )

    return () => observer.disconnect()
  }, [] )

  useEffect( () => { // Scrolling stop detector
    const scrollArea = scrollableAreaRef.current

    if (!scrollArea) return

    let scrollTimeout:number

    const handler = (e:any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const atSnappingPoint = e.target.scrollLeft % e.target.offsetWidth === 0
      const timeOut = atSnappingPoint ? 150 : 150

      clearTimeout( scrollTimeout )
      scrollTimeout = window.setTimeout( () => {
        if (stageRef.current === Stage.SETUP) {
          stageRef.current = Stage.WAITING
          setScrollLeft( scrollArea.scrollLeft )
          return
        }
        if (stageRef.current === Stage.JUMPING) {
          stageRef.current = Stage.WAITING
          return
        }

        if (borderIntersections.current.start !== borderIntersections.current.end) {
          stageRef.current = Stage.JUMPING
          scrollJumperRef.current?.( borderIntersections.current.start ? `start` : `end` )
        }

        setScrollLeft( scrollArea.scrollLeft )

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
  }, [ noloop ] ) // eslint-disable-line react-hooks/exhaustive-deps

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

  const finalClassname = typeof className === `object`
    ? cn( classes.itemContainer, className.override )
    : cn( classes.carousel, classes.itemContainer, className )

  return (
    <div ref={scrollableAreaRef} className={finalClassname} style={{ "--count":maxVisibleCount, gap } as React.CSSProperties}>
      <div ref={firstItemRef} className={classes.extraItems}>
        {extraPrev[ 0 ]}
      </div>
      {extraPrev.slice( 1 )}

      {children}

      {extraNext.slice( 0, -1 )}
      <div ref={lastItemRef} className={classes.extraItems}>
        {extraNext.slice( -1 )}
      </div>
    </div>
  )
}
