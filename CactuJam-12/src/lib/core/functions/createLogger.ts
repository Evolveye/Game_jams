export type LoggerCreatorConfig<T extends string> = {
  logTypes: readonly T[]
  logTypesString: string
}

export default function createLogger<T extends string>({ logTypes, logTypesString }:LoggerCreatorConfig<T>) {
  logTypesString ||= logTypes.join( ` ` )

  return (level:T, ...data:unknown[]) => {
    if (logTypesString.includes( `NOTHING` )) return
    if (logTypesString.includes( `ALL` ) || logTypesString.includes( level )) return console.log( ...data )
    if (!logTypes.includes( level )) throw new Error( `Not implemented log level "${level}"` )
  }
}
