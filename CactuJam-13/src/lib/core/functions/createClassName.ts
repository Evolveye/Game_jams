export function createClassName( ...classes:unknown[] ) {
  const classNameString = classes.reduce(
    (str:string, name) => !name ? str : typeof name === `string`
      ? `${str} ${name.trim()}`
      : str,
      ``,
  ).trim()

  return classNameString || undefined
}

export default function cn( ...classes:unknown[] ) {
  return createClassName( ...classes )
}

export function isOverrideableClassName(className:unknown): className is { override:string } {
  return !!className && typeof className === `object` && `override` in className
}