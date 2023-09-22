export default function filterObject( object ) {
  return Object.fromEntries( Object.entries( object ).filter( ([ , v ]) => Boolean( v ) ) )
}

export function deleteObjectKeys<T extends Record<string, unknown>, U extends string[]>( object:T, ...keys:U ): Omit<T, U[number]> {
  return Object.fromEntries( Object.entries( object ).filter( ([ k ]) => !keys.includes( k ) ) ) as Omit<T, U[number]>
}
