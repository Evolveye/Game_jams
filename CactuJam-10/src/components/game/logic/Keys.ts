export type KeyBindValue = { code:string, result:string }
export type SimplifiedKeyBinds = Record<string, (KeyBindValue | string)[]>
export type KeyBinds = Record<string, KeyBindValue[]>

export default class Keys {
  static #data:Record<string, boolean> = {}
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

  binds:KeyBinds


  constructor( binds:SimplifiedKeyBinds = {} ) {
    const notSimplifiedBinds = {}
    const concatenatedBinds = { ...Keys.predefinedBinds, ...binds }

    for (const bindName in concatenatedBinds) {
      notSimplifiedBinds[ bindName ] = concatenatedBinds[ bindName ].map( b => typeof b === `object` ? b : { code:b, result:true } )
    }

    this.binds = notSimplifiedBinds
  }


  is( code:string ) {
    return Keys.is( code, this.binds )
  }


  static is = (code:string, binds:KeyBinds = {}) => {
    const data = this.#data

    if (/^[a-z]$/i.test( code )) return data[ `Key${code.toUpperCase()}` ]
    if (/^[0-9]$/.test( code )) return data[ `Digit${code}` ]
    if ([ `up`, `right`, `down`, `left` ].includes( code )) return data[ `Arrow${code.charAt( 0 ).toUpperCase() + code.slice( 1 )}` ]
    if (code === `shift`) code = `ShiftLeft`

    const state = data[ code ]

    if (!state && code in binds) {
      return binds[ code ].find( ({ code }) => data[ code ] )?.result ?? false
    }

    return state ?? false
  }


  static onKeyDown = ({ code }:KeyboardEvent) => {
    if (this.#data[ code ]) return

    this.#data[ code ] = true
  }


  static onKeyUp = ({ code }:KeyboardEvent) => {
    this.#data[ code ] = false
  }
}

window?.addEventListener( `keydown`, Keys.onKeyDown )
window?.addEventListener( `keyup`, Keys.onKeyUp )
