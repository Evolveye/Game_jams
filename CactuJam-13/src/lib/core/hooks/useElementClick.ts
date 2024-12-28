import { useEffect, useRef } from "react"

export type ElementClickHookCallback = (clickedInside:boolean) => void

export type ElementClickHookConfig<TRef extends HTMLElement> = {
  cb: ElementClickHookCallback
  ref?: TRef
  activate: boolean
}

export default function useElementClick<TRef extends HTMLElement>({ cb, activate, ref }:ElementClickHookConfig<TRef> ) {
  const elementRef = useRef<TRef>( ref ?? null )

  useEffect( () => {
    if (activate !== undefined && !activate) return

    const handleClick = (e:MouseEvent) => {
      if (!elementRef.current) return
      cb( e.composedPath().includes( elementRef.current ) )
    }

    document.addEventListener( `click`, handleClick )
    return () => document.removeEventListener( `click`, handleClick )
  }, [ activate ] )

  return elementRef
}
