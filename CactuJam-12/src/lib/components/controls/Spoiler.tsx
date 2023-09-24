import { useEffect, useState, useRef, ReactNode } from "react"
import cn from "../../theming/createClassName"
import { createStylesHook } from "../../theming"

export type SpoilerProps = {
  className?: string
  titleClassName?: string
  bodyClassName?: string
  children?: ReactNode
  body?: ReactNode
  title: ReactNode
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
  const beforeFirstClickRef = useRef( true )
  const [ state, setState ] = useState( SpoilerState.CLOSED )
  const [ classes ] = useStyles()

  const open = () => {
    const body = bodyRef.current

    if (!body) return

    setState( SpoilerState.OPENING )

    body.classList.add( classes.isOpening )
    body.addEventListener( `animationend`, () => {
      setState( SpoilerState.OPEN )
    }, { once:true } )
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
    beforeFirstClickRef.current = false

    if ([ SpoilerState.OPENING, SpoilerState.CLOSING ].includes( state )) return
    if (typeof externalIsOpen === `boolean`) return onClick?.( externalIsOpen )

    if (state === SpoilerState.OPEN) close()
    else open()
  }

  useEffect( () => {
    if (typeof externalIsOpen !== `boolean` || beforeFirstClickRef.current) return
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
      onClick={e => e.preventDefault()}
      className={className}
      open={state !== SpoilerState.CLOSED}
    >
      <summary onClick={handleTitleClick} className={titleClassName}>
        {title}
      </summary>

      <div ref={bodyRef} className={cn( classes.body )}>
        <div>
          <div className={bodyClassName}>
            {children}
          </div>
        </div>
      </div>
    </details>
  )
}


const useStyles = createStylesHook( {
  "@keyframes closing": {
    from: { gridTemplateRows:`1fr` },
    to:   { gridTemplateRows:`0fr` },
  },

  "@keyframes opening": {
    from: { gridTemplateRows:`0fr` },
    to:   { gridTemplateRows:`1fr` },
  },

  body: {
    display: `grid`,

    "& > div": {
      overflow: `hidden`,
    },
  },

  isOpening: {
    animation: `0.2s ease $opening`,
    animationFillMode: `forwards`,
  },

  isClosing: {
    animation: `0.2s ease $closing`,
    animationFillMode: `forwards`,
  },
}, `lib::Spoiler` )
