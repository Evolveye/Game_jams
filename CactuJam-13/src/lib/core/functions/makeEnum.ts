export default function makeEnum<Keys extends readonly string[]>( tuple:Keys ) {
  const obj = {} as { [K in Keys[number]]:K }

  tuple.forEach( str => obj[ str as Keys[number] ] = str )

  return obj
}
