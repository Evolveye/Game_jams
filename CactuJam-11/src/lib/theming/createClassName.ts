export function createClassName( ...classes ) {
  const classNameString = classes.reduce(
    (str, name) => name && typeof name === `string` ? `${str} ${name.trim()}` : str
    , ``,
  ).trim()

  return classNameString.length ? classNameString : undefined
}

export default function cn( ...classes ) {
  return createClassName( ...classes )
}

