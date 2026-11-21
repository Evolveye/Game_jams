type Letter =
  | `A` | `B` | `C` | `D` | `E` | `F` | `G` | `H` | `I` | `J` | `K` | `L` | `M`
  | `N` | `O` | `P` | `Q` | `R` | `S` | `T` | `U` | `V` | `W` | `X` | `Y` | `Z`

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** Popular `KeyboardEvent.code` values. Physical key positions, so `KeyW` is the same key on QWERTY and AZERTY. */
export type KeyCode =
  | `Key${Letter}`
  | `Digit${Digit}`
  | `Numpad${Digit}`
  | `F${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | `ArrowUp` | `ArrowDown` | `ArrowLeft` | `ArrowRight`
  | `Space` | `Enter` | `Escape` | `Tab` | `Backspace` | `Delete` | `Insert`
  | `ShiftLeft` | `ShiftRight` | `ControlLeft` | `ControlRight` | `AltLeft` | `AltRight` | `MetaLeft` | `MetaRight` | `CapsLock`
  | `Home` | `End` | `PageUp` | `PageDown`
  | `Minus` | `Equal` | `BracketLeft` | `BracketRight` | `Backslash` | `Semicolon` | `Quote` | `Backquote` | `Comma` | `Period` | `Slash`
  | `NumpadEnter` | `NumpadAdd` | `NumpadSubtract` | `NumpadMultiply` | `NumpadDivide` | `NumpadDecimal`

/** Labels of keys whose code does not read well on its own. */
const KEY_LABELS:Partial<Record<KeyCode, string>> = {
  ArrowUp: `↑`,
  ArrowDown: `↓`,
  ArrowLeft: `←`,
  ArrowRight: `→`,
  Escape: `Esc`,
  ControlLeft: `Ctrl`,
  ControlRight: `Ctrl`,
}

/**
 * Raw keyboard state, identified by `KeyboardEvent.code` (physical key position, layout independent).
 * Call `Keys.update()` once at the start of every frame.
 */
export default class Keys {
  static #held = new Set<string>()
  static #pressedQueue = new Set<string>()
  static #pressedThisFrame = new Set<string>()
  static #blockedCodes = new Set<string>()
  static #lastKey: null | string = null

  static {
    window.addEventListener( `keydown`, event => {
      // Also blocks browser shortcuts with these keys, e.g. Ctrl+S while moving down.
      if (this.#blockedCodes.has( event.code )) event.preventDefault()
      if (event.repeat) return

      this.#lastKey = event.code
      this.#held.add( event.code )
      this.#pressedQueue.add( event.code )
    } )

    window.addEventListener( `keyup`, ({ code }) => this.#held.delete( code ) )
    window.addEventListener( `blur`, () => this.#held.clear() )
  }

  static get lastKey() {
    return this.#lastKey
  }

  /** Moves presses collected since the previous frame into the current frame. */
  static update() {
    this.#pressedThisFrame = this.#pressedQueue
    this.#pressedQueue = new Set()
  }

  /** True while any of the keys is held down. */
  static isHeld( codes:readonly KeyCode[] ) {
    return codes.some( code => this.#held.has( code ) )
  }

  /** True only in the frame in which any of the keys went down. */
  static isPressed( codes:readonly KeyCode[] ) {
    return codes.some( code => this.#pressedThisFrame.has( code ) )
  }

  /**
   * Blocks the browser's default action of the keys (scrolling, Ctrl+S, …) while the page is focused.
   * Browsers do not let pages block some shortcuts, e.g. Ctrl+W, Ctrl+T or Ctrl+N.
   */
  static blockDefault( codes:readonly KeyCode[] ) {
    for (const code of codes) this.#blockedCodes.add( code )
  }

  /** Short label of a key for players, e.g. `KeyW` → `W`, `ShiftLeft` → `Shift`, `ArrowUp` → `↑`. */
  static getLabel( code:KeyCode ) {
    return KEY_LABELS[ code ] ?? code.replace( /^(Key|Digit|Numpad)/, `` ).replace( /(Left|Right)$/, `` )
  }
}
