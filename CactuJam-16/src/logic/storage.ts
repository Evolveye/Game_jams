/** Prefix of every key the game keeps in `localStorage`, so it never mixes with other pages on the same origin. */
const PREFIX = `cj-16:`

/**
 * Reads a saved value, or gives `fallback` when there is none, it is broken, or the browser blocks storage
 * (private mode, blocked site data). The game must work the same without it.
 */
export function loadFromStorage<Value>( key:string, fallback:Value ): Value {
  try {
    const text = localStorage.getItem( PREFIX + key )
    return text === null ? fallback : JSON.parse( text )
  } catch {
    return fallback
  }
}

/** Saves a value; silently does nothing when the browser blocks storage. */
export function saveToStorage( key:string, value:unknown ) {
  try {
    localStorage.setItem( PREFIX + key, JSON.stringify( value ) )
  } catch {
    // Storage is a convenience: without it the value lives only until the page closes.
  }
}

/** Removes a saved value, e.g. to go back to the defaults. */
export function removeFromStorage( key:string ) {
  try {
    localStorage.removeItem( PREFIX + key )
  } catch {
    // Nothing to remove when storage is blocked.
  }
}
