import React, { useCallback, useEffect, useReducer, useRef, useState } from "react"

const Action = {
  INCREMENT: `increment`,
  DECREMENT: `decrement`,
  RESET: `reset`,
}

export default function Trigger({ type = `growing`, interval = 50, increment = 1, min = 0, max, onFinish, onProgress, children }) {
  const reducer = (state, action) => {
    switch (action) {
      case `increment`: return state + increment
      case `decrement`: return state - increment
      case `reset`: return min
    }
  }

  const [ active, setActive ] = useState( null )
  const [ action, setAction ] = useState( `increment` )
  const [ value, dispatch ] = useReducer( reducer, min )
  const intervalIdRef = useRef( null )
  const finish = useCallback( value => {
    clearInterval( intervalIdRef.current )

    onFinish?.( value )

    dispatch( `reset` )
  }, [ intervalIdRef.current ] )


  useEffect( () => {
    if (active === null) return
    if (!active) return finish?.( value )

    intervalIdRef.current = setInterval( () => dispatch( action ), interval )

    return () => clearInterval( intervalIdRef.current )
  }, [ active, action ] )

  useEffect( () => {
    onProgress?.( value )

    if (value >= max) {
      if (type === `growing`) {
        dispatch( Action.RESET )
        finish( value )
      } else {
        setAction( Action.DECREMENT )
      }
    } else if (value <= min) {
      setAction( Action.INCREMENT )
    }
  }, [ value, type ] )


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
