import getWindow from "./getWindow"

export type CookieValue = string | number | boolean

export function getCookies(): Record<string, string> {
  if (!getWindow()) return {}

  const entries = document.cookie.split( `;` )
    .map( kv => kv.split( `=` ).map( it => it.trim() ) )

  return Object.fromEntries( entries )
}

export function getCookie( name:string ): undefined | string {
  return getCookies()[ name ]
}

export function setCookie( name:string, value:CookieValue ) {
  if (!getWindow()) return {}
  if (document.cookie.length) document.cookie += `; `

  document.cookie += `${name}=${value}`
}
