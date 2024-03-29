import { getWindow } from "@lib/core/functions"

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

export default class KeysController {
  static keysMap = new Map<string, KeyInfo>()
  static {
    const win = getWindow()

    if (win) {
      win.addEventListener( `keydown`, ({ code }) => {
        let keyCode = code
        if (code.startsWith( `Key` )) keyCode = code.slice( 3 )
        else if (code.startsWith( `Arrow` )) keyCode = code.slice( 5 )

        keyCode = keyCode.toLowerCase()

        const keyInfo = this.keysMap.get( keyCode )

        if (keyInfo) keyInfo.setPressed( true )
        else this.keysMap.set( keyCode, new KeyInfo( keyCode, true ) )
      } )

      win.addEventListener( `keyup`, ({ code }) => {
        let keyCode = code
        if (code.startsWith( `Key` )) keyCode = code.slice( 3 )
        else if (code.startsWith( `Arrow` )) keyCode = code.slice( 5 )

        keyCode = keyCode.toLowerCase()

        const keyInfo = this.keysMap.get( keyCode )

        if (keyInfo) keyInfo.setPressed( false )
        else this.keysMap.set( keyCode, new KeyInfo( keyCode, false ) )
      } )
    }
  }

  isPressed( ...keynames:string[] ) {
    for (let keyname of keynames) {
      const keyInfo = KeysController.keysMap.get( keyname.toLowerCase() )

      if (keyInfo?.getPressed()) return true
    }

    return false
  }

  isPressedOnce( ...keynames:string[] ) {
    for (let keyname of keynames) {
      const keyInfo = KeysController.keysMap.get( keyname.toLowerCase() )

      if (keyInfo?.getOnce()) return true
    }

    return false
  }
}
