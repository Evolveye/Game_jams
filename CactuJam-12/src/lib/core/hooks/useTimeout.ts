import { useEffect, useRef } from "react"

export default function useTimeout( delay:number, callback:() => void ) {
  const timeoutRef = useRef<number>()

  const clearInterval = () => clearTimeout( timeoutRef.current )

  useEffect( () => {
    timeoutRef.current = setTimeout( callback, delay ) as unknown as number

    return clearInterval
  }, [ callback, delay ] )

  return clearInterval
}
