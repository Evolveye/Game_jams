import { useCallback, useEffect, useRef, useState } from "react"

export default function Trigger({ interval = 50, increment = 1, min = 0, max, onFinish, onProgress, children }) {
  const [ active, setActive ] = useState( null )
  const [ value, setValue ] = useState( min )
  const intervalIdRef = useRef( null )
  const finish = useCallback( value => {
    clearInterval( intervalIdRef.current )

    onFinish?.( value )

    setValue( min )
  }, [ intervalIdRef.current ] )


  useEffect( () => {
    if (active === null) return

    onProgress?.( value )

    if (!active) return finish?.( value )

    intervalIdRef.current = setInterval( () => setValue( v => v + increment ), interval )
  }, [ active ] )

  useEffect( () => {
    if (value >= max) {
      setValue( min )
      finish?.( value )
    }
  }, [ value ] )


  return (
    <button
      onPointerDown={() => setActive( true )}
      onPointerUp={() => setActive( false )}
      onPointerOut={() => setActive( false )}
    >
      {children}
    </button>
  )
}
