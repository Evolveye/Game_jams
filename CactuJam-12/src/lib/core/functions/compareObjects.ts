export type ComparableObject = Record<string | number, unknown>

export default function compareObjects( object1:ComparableObject, object2:ComparableObject ) {
  const keys1 = Object.keys( object1 )
  const keys2 = Object.keys( object2 )

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    const val1 = object1[ key ]
    const val2 = object2[ key ]
    const areObjects = isObject( val1 ) && isObject( val2 )

    if (areObjects ? !compareObjects( val1, val2 ) : val1 !== val2) {
      return false
    }
  }

  return true
}

function isObject( object:unknown ): object is ComparableObject {
  return object != null && typeof object === `object` && !Array.isArray( object )
}
