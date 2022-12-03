import { useEffect, useState } from "react"
import { EnhancedFetchResponse } from "../../http/enhancedFetch"
import { HTTPMethod } from "../../http/HTTPConsts"
import http from "../../http"

export type { HTTPMethod }
export type FetchUrl = string
export type FetchData = Record<string, string | number | undefined | null>
export type UseFetchValue<TData = unknown> = [ undefined | TData, undefined | EnhancedFetchResponse<TData> ]

export default function useFetch<TData=unknown>( method:HTTPMethod, uri:FetchUrl, data:FetchData = {} ): UseFetchValue<TData> {
  const [ httpRes, setHttpRes ] = useState<UseFetchValue<TData>>([ undefined, undefined ])


  useEffect( () => {
    const lowerCaseMethod = method.toLowerCase()

    if (!http[ lowerCaseMethod ]) return

    setHttpRes([ undefined, undefined ])

    http[ lowerCaseMethod ]<TData>( uri, data )?.then( setHttpRes )
  }, [ method, uri ] )


  return httpRes
}
