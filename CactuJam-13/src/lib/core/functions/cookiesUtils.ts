import getWindow from "./getWindow"

export type CookieValue = undefined | null | string | number | boolean | Date

export function getCookies(): Record<string, string> {
  if (!getWindow()) return {}

  const entries = document.cookie.split( `;` )
    .map( kv => kv.split( `=` ).map( it => it.trim() ) )

  return Object.fromEntries( entries )
}

export function getCookie( name:string ): undefined | string {
  return getCookies()[ name ]
}

export function setCookie( name:string, value:CookieValue, secondsToLive:number | Date ) {
  if (!getWindow()) return {}
  if (document.cookie.length) document.cookie += `; `

  if (!value) secondsToLive = new Date( 0 )

  const date = typeof secondsToLive !== `number` ? secondsToLive : new Date( Date.now() + (secondsToLive ?? 0) * 1000 )
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value || ``}; ${expires}; path=/`
}

export function deleteCookie( name:string ) {
  setCookie( name, null, 0 )
}
