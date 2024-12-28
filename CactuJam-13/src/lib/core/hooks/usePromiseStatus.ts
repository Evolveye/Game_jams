import { useState } from "react"
import makeEnum from "@lib/core/functions/makeEnum"

export const Status = makeEnum( [ `IDLE`, `PENDING`, `FULFILLED`, `ERROR` ] as const )
export type Status = keyof typeof Status

export default function usePromiseStatus<T>( treeshold:number = 1000 * 4 ) {
  const [ status, setStatus ] = useState<{status: Status, data: undefined | Error | T}>({
    status: Status.IDLE,
    data: undefined,
  } )

  const dispatch = async(cb:() => Promise<T>) => {
    setStatus({ status:Status.PENDING, data:undefined })

    try {
      const data = await cb()
      setStatus({ status:Status.FULFILLED, data })
    } catch (e) {
      setStatus({ status:Status.ERROR, data:e instanceof Error ? e : undefined })
    } finally {
      if (treeshold !== Infinity) setTimeout( () => setStatus({ status:Status.IDLE, data:undefined }), treeshold )
    }
  }

  return [ status, dispatch ] as [ typeof status, typeof dispatch ]
}
