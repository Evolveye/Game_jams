/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"

export type Objectkey = string | number | symbol

export type InitialValue<K extends Objectkey, V> = null | Record<K, V> | (() => null | Record<K, V>)

type Dispatcher<T> = (prevObj:T) => Partial<T>
export type StateDispatcher<K extends Objectkey, V, Value extends null | Record<string, unknown>> = {
  (dispatcher:Dispatcher<Value>): void
  (obj:Partial<Value>): void
  (key:K, value:V): void
}

type RetType<K extends Objectkey, V, Value extends null | Record<any, any>> = [Value, StateDispatcher<K, V, Value>]

type RetFromGeneric<T> = T extends Record<infer K, infer V>
  ? RetType<K, V, Partial<T>>
  : T extends undefined
    ? RetType<string, any, Record<string, unknown>>
    : RetType<string, T, Record<string, T>>

type RetFromInit<Init extends InitialValue<any, any>> = [Init] extends [((...params:any[]) => infer R)]
  ? [R] extends [InitialValue<infer K, infer V>]
    ? [R] extends [null]
      ? RetType<K, V, null | Record<string, unknown>>
      : RetType<K, V, R>
    : never
  : Init extends InitialValue<infer K, infer V>
    ? [Init] extends [null]
      ? RetType<K, V, null | Record<string, unknown>>
      : RetType<K, V, Init>
    : never

type ImplementedRet<K extends Objectkey, V, Init extends InitialValue<K, V>> = Init extends undefined ? RetType<K, V, Record<K, V>> : RetFromInit<Init>

export default useObjectState
export function useObjectState<T = undefined>():RetFromGeneric<T>
export function useObjectState<K extends string, V>():RetFromInit<Record<K, V>>
export function useObjectState<K extends string, V, Init extends InitialValue<K, V> = InitialValue<K, V>>( initialValue:Init ):RetFromInit<Init>
export function useObjectState<
  K extends string,
  V extends unknown,
  Init extends InitialValue<K, V>,
>(
  initialValue?:Init,
): ImplementedRet<K, V, Init> {
  const [ state, setState ] = useState<null | Partial<Record<K, V>>>(
    (initialValue !== undefined ? (typeof initialValue === `function` ? initialValue() : initialValue) : {} as Record<K, V>),
  )

  type State = typeof state

  const setStateObject:StateDispatcher<K, V, State> = (dispatcherOrObjOrKey:Dispatcher<State> | Partial<State> | K, maybeValue?:V) => {
    if (typeof dispatcherOrObjOrKey === `function`) {
      return setState( prevObj => dispatcherOrObjOrKey( prevObj ) )
    }

    if (typeof dispatcherOrObjOrKey === `object` && !Array.isArray( dispatcherOrObjOrKey )) {
      return setState( prevObj => {
        if (prevObj) return { ...prevObj, ...dispatcherOrObjOrKey  }
        return { ...dispatcherOrObjOrKey }
      } )
    }

    if (typeof dispatcherOrObjOrKey === `string` && maybeValue) {
      return setState( prevObj => {
        if (prevObj) return { ...prevObj, [ dispatcherOrObjOrKey ]:maybeValue }
        return { [ dispatcherOrObjOrKey ]:maybeValue } as Record<K, V>
      } )
    }
  }

  return [ state, setStateObject ] as ImplementedRet<K, V, Init>
}

// function Test() {
//   const [ values_1, setValues_1 ] = useObjectState()
//   const [ values_2, setValues_2 ] = useObjectState( null )
//   const [ values_3, setValues_3 ] = useObjectState({ a:1 })
//   const [ values_4, setValues_4 ] = useObjectState<{ b: number }>()
//   const [ values_5, setValues_5 ] = useObjectState( () => null )
//   const [ values_6, setValues_6 ] = useObjectState( () => ({ c:1, d:2 }) )
//   const [ values_7, setValues_7 ] = useObjectState( () => Math.random() > 0.5 ? { e:3 } : null )
//   const [ values_8, setValues_8 ] = useObjectState<string, number>()

//   values_1.abc
//   setValues_1( null )
//   setValues_1({ a:1 })
//   setValues_1( ``, 2 )
//   setValues_1( () => ({ abc:3 }) )
//   setValues_1( () => `4` )
//   setValues_1( () => 5 )

//   values_2.abc
//   values_2?.abc
//   setValues_2( null )
//   setValues_2({ a:1 })
//   setValues_2( `abc`, 2 )
//   setValues_2( () => ({ abc:3 }) )
//   setValues_2( () => `4` )
//   setValues_2( () => 5 )

//   values_3.abc
//   values_3?.abc
//   values_3.a
//   setValues_3( null )
//   setValues_3({ a:1 })
//   setValues_3( `a`, 2 )
//   setValues_3( () => ({ a:3 }) )
//   setValues_3( () => ({ abc:3 }) )
//   setValues_3( () => `a` )
//   setValues_3( () => 3 )

//   values_4.abc
//   values_4.b
//   values_4?.b
//   setValues_4( null )
//   setValues_4({ b:1 })
//   setValues_4( `b`, 2 )
//   setValues_4( () => ({ b:3 }) )
//   setValues_4( () => ({ a:3 }) )
//   setValues_4( () => `a` )
//   setValues_4( () => 3 )

//   values_5.abc
//   values_5?.abc
//   setValues_5( null )
//   setValues_5({ abc:1 })
//   setValues_5( `abc`, 2 )
//   setValues_5( () => ({ abc:3 }) )
//   setValues_5( () => `a` )
//   setValues_5( () => 3 )

//   values_6.abc
//   values_6.c
//   setValues_6({ c:2 })
//   setValues_6( `d`, 2 )
//   setValues_6( () => ({ c:3 }) )
//   setValues_6( () => `a` )
//   setValues_6( () => 3 )

//   values_7.abc
//   values_7?.abc
//   values_7.e
//   values_7?.e
//   setValues_7({ e:2 })
//   setValues_7( `e`, 2 )
//   setValues_7( () => ({ e:1 }) )
//   setValues_7( () => `a` )
//   setValues_7( () => 3 )

//   values_8.abc
//   values_8?.abc
//   values_8.e
//   values_8?.e
//   setValues_8({ e:2 })
//   setValues_8( `e`, 2 )
//   setValues_8( () => ({ e:1 }) )
//   setValues_9( () => `a` )
//   setValues_9( () => 3 )
// }
