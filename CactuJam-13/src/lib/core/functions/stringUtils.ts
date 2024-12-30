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

export function makeCamelCaseFromWords( str:string | undefined ) {
  const trimmed = str?.trim().toLowerCase()
  return !trimmed ? `` : trimmed.charAt( 0 ) + trimmed.slice( 1 ).replace( / +\w/g, match => match.at( -1 )!.toUpperCase() )
}
export function makeKebabCaseFromCamelCase( str:string | undefined ) {
  const trimmed = str?.trim()
  return !trimmed ? `` : trimmed.replace( /[A-Z]/g, match => `-` + match.at( -1 )!.toLowerCase() )
}

export function makeKebabCaseFromWords( str:string | undefined ) {
  const trimmed = str?.trim().toLowerCase()
  return !trimmed ? `` : trimmed.replace( / +/g, `-` )
}

export type NumberStringParserConfig = {
  max?: string | number
  allowNegatives?: boolean
  integerDigits?: number
  fractionDigits?: number
}
