/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectLeaves, ObjectValueFromKeysChain } from "../types/ObjectKeys"

export function filterObject( object:Record<string, any> ) {
  return Object.fromEntries( Object.entries( object ).filter( ([ , v ]) => Boolean( v ) ) )
}

export function deleteObjectKeys<T extends Record<string, unknown>, U extends string[]>( object:T, ...keys:U ): Omit<T, U[number]> {
  return Object.fromEntries( Object.entries( object ).filter( ([ k ]) => !keys.includes( k ) ) ) as Omit<T, U[number]>
}


export function objectValueFromKeysChain<T extends Record<string, unknown>, KChain extends ObjectLeaves<T>, Val extends ObjectValueFromKeysChain<T, KChain>>( target:T, keysChain:ObjectLeaves<T> ): Val {
  const keys = keysChain.split( `.` )
  const value = keys.reduce( (obj, key) => obj[ key ] as any, target ) as any as Val

  return value
}
