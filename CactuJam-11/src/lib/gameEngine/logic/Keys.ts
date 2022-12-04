import getWindow from "@lib/core/functions/getWindow"

export type KeyData = {
  active: boolean
  readers: any[]
  dispatchers: (() => void)[]
}

export default class Keys {
  static #keys: Record<string, KeyData> = {}

  static {
    const window = getWindow()

    if (window) {
      window.addEventListener( `keydown`, ({ key }) => {
        Keys.#assertKeyData( key )
        this.#keys[ key ].dispatchers.forEach( fn => fn() )
        this.#keys[ key ].active = true
      } )

      window.addEventListener( `keyup`, ({ key }) => {
        Keys.#assertKeyData( key )
        this.#keys[ key ].readers = []
        this.#keys[ key ].active = false
      } )
    }
  }

  isActive = (key:string) => Keys.isActive( key )
  isActiveOnce = (key:string) => Keys.isActiveOnce( key, this )
  on = (key:string, dispatcher:() => void) => Keys.on( key, dispatcher )

  static dispatchkey = (key:string, state:boolean) => {
    this.#keys[ key ].active = state
  }

  static isActive( key:string ) {
    return this.#keys[ key ].active
  }

  static isActiveOnce( key:string, object:any ) {
    const keyData = this.#keys[ key ]

    if (keyData.readers.includes( object )) return false
    if (keyData.active) keyData.readers.push( object )

    return keyData.active
  }

  static on( key:string, dispatcher:() => void ) {
    Keys.#assertKeyData( key )
    this.#keys[ key ].dispatchers.push( dispatcher )
  }

  static #assertKeyData( key:string ) {
    this.#keys[ key ] ||= { active:false, readers:[], dispatchers:[] }
  }
}
