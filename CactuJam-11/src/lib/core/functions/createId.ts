import { binaryStrToHexStr, createBinarySizedStr } from "./stringUtils"

export type Snowflake = string

type IdPart = {
  num: number
  bits: number
}

const resourceIdentifiers = new Map<string, number>()

const additionalPartGenerator = (() => {
  const createGenerator = function * () {
    let addition = 0

    while (true) {
      yield addition++
      if (addition >= 0xff) addition = 0
    }
  }

  const generator = createGenerator()

  return () => generator.next().value
})()

export default function createId( resourceType:string ): Snowflake {
  if (!resourceIdentifiers.has( resourceType )) {
    resourceIdentifiers.set( resourceType, resourceIdentifiers.size )
  }

  const idParts:IdPart[] = [
    { num:resourceIdentifiers.get( resourceType )!, bits:8 },
    { num:Date.now(), bits:42 },
    { num:additionalPartGenerator(), bits:8 },
    { num:0, bits:6 },
  ]

  const binaryId = idParts.map( i => createBinarySizedStr( i.num, i.bits ) ).join( `` )
  const id = binaryStrToHexStr( binaryId )!

  return id
}
