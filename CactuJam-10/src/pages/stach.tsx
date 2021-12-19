import React, { useEffect, useRef, useState } from "react"
import composePage from "../core/functions/composePage"
import MainLayout from "../core/layouts/main"

function Trigger({ onFinish, onProgress, children }) {
  const [ active, setActive ] = useState( null )
  const [ value, setValue ] = useState( 1 )
  const intervalIdRef = useRef( null )


  useEffect( () => {
    if (active === null) return

    onProgress( value )

    if (!active) {
      clearInterval( intervalIdRef.current )

      onFinish( value )

      setValue( 1 )
      return
    }

    intervalIdRef.current = setInterval( () => {
      setValue( v => v + 2 )
    }, 100 )
  }, [ active ] )


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

export default composePage({
  component: Trigger,
  layout: MainLayout,
})
