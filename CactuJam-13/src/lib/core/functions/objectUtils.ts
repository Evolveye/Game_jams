/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectsDeepMerge } from "../types/ObjectKeys"
import { ObjectLeaves, ObjectValueFromKeysChain } from "../types/ObjectKeys"

export function isObj( item:unknown ): item is Record<string, unknown> {
  return (!!item && typeof item === `object` && !Array.isArray( item ))
}

export function filterObject( object:Record<string, any>, fn?:(k:string, v:unknown) => boolean ) {
  return Object.fromEntries( Object.entries( object ).filter( ([ k, v ]) => fn?.( k, v ) ?? Boolean( v ) ) )
}

export function deleteObjectKeys<T extends Record<string, unknown>, U extends string[]>( object:T, ...keys:U ): Omit<T, U[number]> {
  return Object.fromEntries( Object.entries( object ).filter( ([ k ]) => !keys.includes( k ) ) ) as Omit<T, U[number]>
}

export function objectValueFromKeysChain<
  T extends Record<string, unknown>,
  KChain extends ObjectLeaves<T>, Val extends ObjectValueFromKeysChain<T, KChain>
>( target:T, keysChain:string ): Val {
  const keys = keysChain.split( `.` )
  const value = keys.reduce( (obj, key) => obj?.[ key ] as any, target ) as any as Val

  return value
}

export function deepMergeObjects<T extends Record<string, unknown>, U extends Record<string, unknown>>( objA:T, objB:U ) {
  return mergeDeep( {}, objA, objB ) as ObjectsDeepMerge<T, U>
}

function mergeDeep( target:unknown, ...sources:unknown[] ): unknown {
  if (!sources.length) return target

  const source = sources.shift()

  if (isObj( target ) && isObj( source )) {
    for (const key in source) {
      if (isObj( source[ key ] )) {
        if (!target[ key ]) Object.assign( target, { [ key ]:{} } )
        mergeDeep( target[ key ], source[ key ] )
      } else {
        Object.assign( target, { [ key ]:source[ key ] } )
      }
    }
  }

  return mergeDeep( target, ...sources )
}
