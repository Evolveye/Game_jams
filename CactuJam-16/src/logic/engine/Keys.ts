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

/** Keys whose default browser behaviour (page scrolling) is blocked. */
const BLOCKED_KEYS = new Set<string>([ `Space`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` ] satisfies KeyCode[])

/**
 * Raw keyboard state, identified by `KeyboardEvent.code` (physical key position, layout independent).
 * Call `Keys.update()` once at the start of every frame.
 */
export default class Keys {
  static #held = new Set<string>()
  static #pressedQueue = new Set<string>()
  static #pressedThisFrame = new Set<string>()
  static #lastKey: null | string = null

  static {
    window.addEventListener( `keydown`, event => {
      if (BLOCKED_KEYS.has( event.code )) event.preventDefault()
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
}
