export function matchAllGroups<Groups>( str:string, reg:RegExp ) {
  const groups:Groups[] = []
  let match

  while ((match = reg.exec( str ))) groups.push( match.groups as Groups )

  return groups
}
