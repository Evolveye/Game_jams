export default function connectPaths( ...paths:string[] ) {
  const slashedPaths = paths.map( (path, i) => {
    const fixedStart = path.startsWith( `/` ) && i !== 0 ? path.slice( 1 ) : path
    const fixedEnd = fixedStart.endsWith( `/` ) && i !== path.length - 1 ? fixedStart.slice( 0, -1 ) : fixedStart

    return fixedEnd
  } )

  return slashedPaths.join( `/` )
}
