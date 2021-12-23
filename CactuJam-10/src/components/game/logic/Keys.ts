import getWindow from "../../../core/functions/getWindow"

export type KeyBindValue = { code:string, result:string }
export type SimplifiedKeyBinds = Record<string, (KeyBindValue | string)[]>
export type KeyBinds = Record<string, KeyBindValue[]>
export type KeyState = { code:string, active:boolean, updatedAt:number }

export default class Keys {
  static #data:Record<string, KeyState> = {}
  static predefinedBinds:SimplifiedKeyBinds = {
    controls: [
      { code:`KeyW`,  result:`up` },    { code:`ArrowUp`,     result:`up` },
      { code:`KeyD`,  result:`right` }, { code:`ArrowRight`,  result:`right` },
      { code:`KeyS`,  result:`down` },  { code:`ArrowDown`,   result:`down` },
      { code:`KeyA`,  result:`left` },  { code:`ArrowLeft`,   result:`left` },
    ],
    leftDirection: [ `KeyA`, `ArrowLeft` ],
    rightDirection: [ `KeyD`, `ArrowRight` ],
    upDirection: [ `KeyW`, `ArrowUp` ],
    downDirection: [ `KeyS`, `ArrowDown` ],
  }

  #timeOfusedKeys:Record<string, number> = {}

  binds:KeyBinds


  constructor( binds:SimplifiedKeyBinds = {} ) {
    const notSimplifiedBinds = {}
    const concatenatedBinds = { ...Keys.predefinedBinds, ...binds }

    for (const bindName in concatenatedBinds) {
      notSimplifiedBinds[ bindName ] = concatenatedBinds[ bindName ].map( b => typeof b === `object` ? b : { code:b, result:true } )
    }

    this.binds = notSimplifiedBinds
  }


  is( code:string ):boolean {
    return Keys.is( code, this.binds ).active
  }

  isOnce( code:string ):boolean {
    const times = this.#timeOfusedKeys
    const { active, updatedAt } = Keys.is( code, this.binds )

    if (code in times && times[ code ] === updatedAt) return false
    if (!active) return false

    this.#timeOfusedKeys[ code ] = updatedAt

    return true
  }


  static is = (code:string, binds:KeyBinds = {}):KeyState => {
    const data = this.#data

    if (/^[a-z]$/i.test( code )) code = `Key${code.toUpperCase()}`
    else if (/^[0-9]$/.test( code )) code = `Digit${code}`
    else if ([ `up`, `right`, `down`, `left` ].includes( code )) code = `Arrow${code.charAt( 0 ).toUpperCase() + code.slice( 1 )}`
    else if (code === `shift`) code = `ShiftLeft`

    let state = data[ code ]

    if (!state && code in binds) {
      const bind = binds[ code ].find( ({ code }) => data[ code ]?.active )

      if (bind) {
        const stateFromBind = data[ bind.code ]

        state = { ...stateFromBind, code:bind.code }
      }
    }

    return state ?? { code, active:false, updatedAt:0 }
  }


  static onKeyDown = ({ code }:KeyboardEvent) => {
    if (this.#data[ code ]?.active) return

    this.#data[ code ] = { code, active:true, updatedAt:Date.now() }
  }


  static onKeyUp = ({ code }:KeyboardEvent) => {
    this.#data[ code ] = { code, active:false, updatedAt:Date.now() }
  }
}

getWindow()?.addEventListener( `keydown`, Keys.onKeyDown )
getWindow()?.addEventListener( `keyup`, Keys.onKeyUp )
