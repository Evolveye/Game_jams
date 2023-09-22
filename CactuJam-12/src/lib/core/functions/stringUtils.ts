export function separateStr( str:string, sectionSize:number, separator:string, fromEnd = false ) {
  const initialSectionSize = fromEnd ? (str.length % sectionSize) : 0
  const strParts = [ str.slice( 0, initialSectionSize ) ]

  for (let i = initialSectionSize;  i < str.length;  i += sectionSize) {
    strParts.push( str.slice( i, i + sectionSize ) )
  }

  return strParts.join( separator )
}

export function putIntoStr( str:string, index:number, addition:string ) {
  return str.slice( 0, index ) + addition + str.slice( index )
}

export function createBinarySizedStr( number:number, bits:number ) {
  return number.toString( 2 ).padStart( bits, `0` )
}

export function binaryStrToHexStr( binaryStr:string ) {
  return binaryStr.match( /(\d{4})/g )?.map( it => parseInt( it, 2 ).toString( 32 ) ).join( `` )
}

export function changePascalToKebabCase( str:string ) {
  return str.charAt( 0 ).toLowerCase() + str.slice( 1 ).replace( /[A-Z]/g, m => `-` + m.toLowerCase() )
}
