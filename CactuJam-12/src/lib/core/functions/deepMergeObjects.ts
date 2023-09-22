import { ObjectsDeepMerge } from "../types/ObjectKeys"

function isObject( item:unknown ): item is Record<string, unknown> {
  return (!!item && typeof item === `object` && !Array.isArray( item ))
}

function mergeDeep( target:unknown, ...sources:unknown[] ) {
  if (!sources.length) return target

  const source = sources.shift()

  if (isObject( target ) && isObject( source )) {
    for (const key in source) {
      if (isObject( source[ key ] )) {
        if (!target[ key ]) Object.assign( target, { [ key ]:{} } )
        mergeDeep( target[ key ], source[ key ] )
      } else {
        Object.assign( target, { [ key ]:source[ key ] } )
      }
    }
  }

  return mergeDeep( target, ...sources )
}

export default function deepMergeObjects<T extends Record<string, unknown>, U extends Record<string, unknown>>( objA:T, objB:U ) {
  return mergeDeep( {}, objA, objB ) as ObjectsDeepMerge<T, U>
}
