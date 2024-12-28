"use client"

import { useEffect, useState, useRef } from "react"
import cn from "../functions/createClassName"
import "./spoiler.css"
import classes from "./spoiler.module.css"

export type SpoilerProps = {
  className?: string
  titleClassName?: string
  bodyClassName?: string
  children?: React.ReactNode
  body?: React.ReactNode
  title: React.ReactNode
  onClick?: (state:boolean) => void
  opened?: boolean
}

const SpoilerState = {
  OPENING: `OPENING`,
  OPEN: `OPEN`,
  CLOSING: `CLOSING`,
  CLOSED: `CLOSED`,
}

export default function Spoiler({ title, children, body, onClick, opened:externalIsOpen, className, titleClassName, bodyClassName }:SpoilerProps) {
  children ||= body

  const bodyRef = useRef<HTMLDivElement>( null )
  const [ state, setState ] = useState( SpoilerState.CLOSED )

  const open = () => {
    const body = bodyRef.current

    if (!body) return

    setState( SpoilerState.OPENING )

    body.classList.add( classes.isOpening )
    body.addEventListener(
      `animationend`,
      () => setState( SpoilerState.OPEN ),
      { once:true },
    )
  }

  const close = () => {
    const body = bodyRef.current
    if (!body) return

    setState( SpoilerState.CLOSING )

    body.classList.add( classes.isClosing )
    body.addEventListener( `animationend`, () => {
      setState( SpoilerState.CLOSED )
    }, { once:true } )
  }

  const handleTitleClick = () => {
    if ([ SpoilerState.OPENING, SpoilerState.CLOSING ].includes( state )) return
    if (typeof externalIsOpen === `boolean`) return onClick?.( externalIsOpen )

    if (state === SpoilerState.OPEN) close()
    else open()
  }

  useEffect( () => {
    if (typeof externalIsOpen !== `boolean`) return
    if (externalIsOpen) open()
    else close()
  }, [ externalIsOpen ] )

  useEffect( () => {
    const classList = bodyRef.current?.classList

    if (!classList) return
    if (state === SpoilerState.CLOSED) classList.remove( classes.isClosing )
    else if (state === SpoilerState.OPEN) classList.remove( classes.isOpening )
  }, [ state ] )

  return (
    <details
      onClick={e => `tagName` in e.target && e.target.tagName === `SUMMARY` && e.preventDefault()}
      className={className}
      open={state !== SpoilerState.CLOSED}
    >
      <summary onClick={handleTitleClick} className={titleClassName}>
        {title}
      </summary>

      <div ref={bodyRef} className={cn( classes.body )}>
        <div className={bodyClassName}>
          {children}
        </div>
      </div>
    </details>
  )
}
