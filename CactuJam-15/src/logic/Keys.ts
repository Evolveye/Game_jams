export type KeyCode = (typeof KeyCodeMap extends Map<infer K, string> ? K : never) | (string & {})

const KeyCodeMap = new Map([
  ...([
    `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `0`,
  ] as const).map( d => [ d, `Digit${d}` ] as const ),
  ...([
    `q`, `w`, `e`, `r`, `t`, `y`, `u`, `i`, `o`, `p`,
    `a`, `s`, `d`, `f`, `g`, `h`, `j`, `k`, `l`,
    `z`, `x`, `c`, `v`, `b`, `n`, `m`,
  ] as const).map( k => [ k, `Key${k.toUpperCase()}` ] as const ),
  ...([
    `space`, `shiftleft`, `shiftright`, `controlleft`, `controlright`, `altleft`, `altright`,
  ] as const).map( k => [ k, k.charAt( 0 ).toUpperCase() + k.slice( 1 ) ] as const ),
  ...([
    `left`, `right`, `up`, `down`,
  ] as const).map( k => [ k, `Arrow` + k.charAt( 0 ).toUpperCase() + k.slice( 1 ) ] as const ),
])

export class KeyInfo {
  code: string
  #pressed: boolean
  #onceConsumed: boolean

  constructor( code:string, pressed:boolean = false, onceConsumed:boolean = false ) {
    this.code = code
    this.#pressed = pressed
    this.#onceConsumed = onceConsumed
  }

  setPressed( pressed:boolean ) {
    if (this.#pressed === pressed) return

    this.#onceConsumed = false
    this.#pressed = pressed
  }

  getPressed() {
    return this.#pressed
  }

  getOnce() {
    if (!this.#pressed || this.#onceConsumed) return false

    this.#onceConsumed = true
    return true
  }
}

export default class Keys {
  static readonly keysMap = new Map<string, KeyInfo>()
  static #lastKey: null | string = null // eslint-disable-line sonarjs/public-static-readonly -- This is global value editable only from inside this class

  static {
    if (typeof window !== `undefined`) {
      window.addEventListener( `keydown`, ({ code }) => {
        this.#lastKey = code

        const keyInfo = this.keysMap.get( code )

        if (keyInfo) keyInfo.setPressed( true )
        else this.keysMap.set( code, new KeyInfo( code, true ) )
      } )

      window.addEventListener( `keyup`, ({ code }) => {
        this.keysMap.delete( code )
      } )
    }
  }

  static get lastkey() {
    return this.#lastKey
  }

  static isPressed( keyCodes:KeyCode[] ) {
    for (const keyCode of keyCodes) {
      const keyInfo = Keys.keysMap.get( keyCode )

      if (keyInfo?.getPressed()) return true
    }

    return false
  }

  static isPressedOnce( ...keynames:KeyCode[] ) {
    for (const keyname of keynames) {
      const keyInfo = Keys.keysMap.get( keyname )

      if (keyInfo?.getOnce()) return true
    }

    return false
  }

  static getKeyCode( codeShort:KeyCode ) {
    // @ts-expect-error
    return KeyCodeMap.get( codeShort ) ?? codeShort
  }
}
