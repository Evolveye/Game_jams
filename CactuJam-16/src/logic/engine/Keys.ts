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
  // Mouse, bound like keys. Wheel inputs are only ever "pressed", never held.
  | `MouseLeft` | `MouseMiddle` | `MouseRight` | `WheelUp` | `WheelDown`

/** Labels of keys whose code does not read well on its own. */
const KEY_LABELS:Partial<Record<KeyCode, string>> = {
  ArrowUp: `↑`,
  ArrowDown: `↓`,
  ArrowLeft: `←`,
  ArrowRight: `→`,
  Escape: `Esc`,
  ControlLeft: `Ctrl`,
  ControlRight: `Ctrl`,
  MouseLeft: `LPM`,
  MouseMiddle: `ŚPM`,
  MouseRight: `PPM`,
  WheelUp: `Kółko ↑`,
  WheelDown: `Kółko ↓`,
}

/** Mouse inputs by `MouseEvent.button`. */
const MOUSE_BUTTONS:KeyCode[] = [ `MouseLeft`, `MouseMiddle`, `MouseRight` ]

/** Scroll distance (in pixels) of one wheel step. Touchpads send many small events that add up to it. */
const WHEEL_STEP = 50

/** Pixels per line, for browsers that report wheel scrolling in lines. */
const WHEEL_LINE_HEIGHT = 33

/**
 * Raw keyboard and mouse state. Keys are identified by `KeyboardEvent.code` (physical key position,
 * layout independent), mouse inputs by their own codes (`MouseLeft`, `WheelUp`, …).
 * Call `Keys.update()` once at the start of every frame.
 */
export default class Keys {
  static #held = new Set<string>()
  static #pressedQueue = new Set<string>()
  static #pressedThisFrame = new Set<string>()
  static #blockedCodes = new Set<string>()
  static #lastKey: null | string = null
  static #pointer: null | { clientX:number, clientY:number } = null
  static #wheelDistance = 0

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

    // Released anywhere, also outside the element that caught the press.
    window.addEventListener( `mouseup`, ({ button }) => {
      const code = MOUSE_BUTTONS[ button ]
      if (code) this.#held.delete( code )
    } )
  }

  static get lastKey() {
    return this.#lastKey
  }

  /** Last mouse position over the element passed to `listenToPointer()`, in client coordinates. */
  static get pointer() {
    return this.#pointer
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

  /** Every input that went down in this frame, e.g. to bind a key to an action. */
  static getPressedCodes() {
    return [ ...this.#pressedThisFrame ] as KeyCode[]
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

  /**
   * Starts reading the mouse over the element (e.g. the game canvas): buttons, wheel and position.
   * Only that element, so scrolling or clicking other parts of the page keeps working normally.
   */
  static listenToPointer( element:HTMLElement ) {
    element.addEventListener( `mousedown`, event => {
      const code = MOUSE_BUTTONS[ event.button ]
      if (!code) return

      event.preventDefault()
      this.#held.add( code )
      this.#pressedQueue.add( code )
    } )

    element.addEventListener( `mousemove`, ({ clientX, clientY }) => {
      this.#pointer = { clientX, clientY }
    } )

    element.addEventListener( `wheel`, event => {
      event.preventDefault()
      this.#addWheelDistance( event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * WHEEL_LINE_HEIGHT : event.deltaY )
    }, { passive:false } )

    // The right button is free to be bound to an action.
    element.addEventListener( `contextmenu`, event => event.preventDefault() )
  }

  /**
   * Waits for the next mouse button or wheel step anywhere on the page, not only over the element passed to
   * `listenToPointer()`, e.g. to bind it to an action. That click does not reach the page (it presses no button).
   * Stops listening once `signal` aborts.
   */
  static waitForPointerInput( signal:AbortSignal ) {
    return new Promise<KeyCode>( resolve => {
      const listening = new AbortController()
      const options = { capture:true, signal:AbortSignal.any([ signal, listening.signal ]) }

      const finish = (event:Event, code:KeyCode) => {
        event.preventDefault()
        event.stopPropagation()
        listening.abort()

        // The click that follows this press must not press whatever is under the cursor, nor open the context menu.
        if (code === `MouseLeft`) window.addEventListener( `click`, event => event.stopPropagation(), { capture:true, once:true } )
        if (code === `MouseRight`) window.addEventListener( `contextmenu`, event => event.preventDefault(), { capture:true, once:true } )

        resolve( code )
      }

      window.addEventListener( `mousedown`, event => {
        const code = MOUSE_BUTTONS[ event.button ]
        if (code) finish( event, code )
      }, options )

      window.addEventListener( `wheel`, event => {
        if (event.deltaY) finish( event, event.deltaY < 0 ? `WheelUp` : `WheelDown` )
      }, { ...options, passive:false } )
    } )
  }

  /** Short label of a key for players, e.g. `KeyW` → `W`, `ShiftLeft` → `Shift`, `ArrowUp` → `↑`. */
  static getLabel( code:KeyCode ) {
    return KEY_LABELS[ code ] ?? code.replace( /^(Key|Digit|Numpad)/, `` ).replace( /(Left|Right)$/, `` )
  }

  /** Turns accumulated scrolling into wheel presses, at most one per direction and frame. */
  static #addWheelDistance( distance:number ) {
    // Changing direction starts counting anew.
    if (Math.sign( distance ) !== Math.sign( this.#wheelDistance )) this.#wheelDistance = 0

    this.#wheelDistance += distance
    if (Math.abs( this.#wheelDistance ) < WHEEL_STEP) return

    this.#pressedQueue.add( this.#wheelDistance < 0 ? `WheelUp` : `WheelDown` )
    this.#wheelDistance = 0
  }
}
