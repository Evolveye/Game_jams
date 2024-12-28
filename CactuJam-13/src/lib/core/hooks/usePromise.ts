/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState } from "react"

export default function usePromise<T extends Promise<any>>( promise:T, dependencies:unknown[] = [] ): [ boolean, undefined | Awaited<T>, undefined | Error ] {
  const [ isLoading, setLoading ] = useState<boolean>( true )
  const [ value, setValue ] = useState<undefined | Awaited<T>>( undefined )
  const [ error, setError ] = useState<undefined | Error>( undefined )

  const memoizedCallback = useCallback( () => {
    setLoading( true )
    setValue( undefined )
    setError( undefined )

    promise.then( setValue ).catch( setError ).finally( () => setLoading( false ) )
  }, dependencies )

  useEffect( () => {
    memoizedCallback()
  }, [ memoizedCallback ] )

  return [ isLoading, value, error ]
}
