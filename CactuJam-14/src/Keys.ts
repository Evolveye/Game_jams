export type KeyName =
  | `1` | `2` | `3` | `4` | `5` | `6` | `7` | `8` | `9` | `0`
  | `q` | `w` | `e` | `r` | `t` | `y` | `u` | `i` | `o` | `p`
  | `a` | `s` | `d` | `f` | `g` | `h` | `j` | `k` | `l`
  | `z` | `x` | `c` | `v` | `b` | `n` | `m`
  | `space` | `shiftleft` | `shiftright` | `controlleft` | `controlright` | `altleft` | `altright`
  | `left` | `right` | `up` | `down`
  | (string & {})

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
  static #lastKey: null | KeyName = null // eslint-disable-line sonarjs/public-static-readonly -- This is global value editable only from inside this class

  static {
    if (typeof window !== `undefined`) {
      window.addEventListener( `keydown`, ({ code }) => {
        let keyCode = code
        if (code.startsWith( `Key` )) keyCode = code.slice( 3 )
        else if (code.startsWith( `Arrow` )) keyCode = code.slice( 5 )
        else if (code.startsWith( `Digit` )) keyCode = code.slice( 5 )

        keyCode = keyCode.toLowerCase()
        this.#lastKey = keyCode

        const keyInfo = this.keysMap.get( keyCode )

        if (keyInfo) keyInfo.setPressed( true )
        else this.keysMap.set( keyCode, new KeyInfo( keyCode, true ) )
      } )

      window.addEventListener( `keyup`, ({ code }) => {
        let keyCode = code
        if (code.startsWith( `Key` )) keyCode = code.slice( 3 )
        else if (code.startsWith( `Arrow` )) keyCode = code.slice( 5 )

        keyCode = keyCode.toLowerCase()

        this.keysMap.delete( keyCode )

        // const keyInfo = this.keysMap.get( keyCode )
        // if (keyInfo) keyInfo.setPressed( false )
        // else this.keysMap.set( keyCode, new KeyInfo( keyCode, false ) )
      } )
    }
  }

  static get lastkey() {
    return this.#lastKey
  }

  static isPressed( ...keynames:KeyName[] ) {
    for (const keyname of keynames) {
      const keyInfo = Keys.keysMap.get( keyname.toLowerCase() )

      if (keyInfo?.getPressed()) return true
    }

    return false
  }

  static isPressedOnce( ...keynames:KeyName[] ) {
    for (const keyname of keynames) {
      const keyInfo = Keys.keysMap.get( keyname.toLowerCase() )

      if (keyInfo?.getOnce()) return true
    }

    return false
  }
}
