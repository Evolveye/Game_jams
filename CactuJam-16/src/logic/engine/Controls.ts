import Keys, { type KeyCode } from "./Keys"

export type Bindings<Action extends string> = Record<Action, KeyCode[]>
export type ActionHandlers<Action extends string> = Partial<Record<Action, () => void>>

/** Action names of a `Controls` instance type, e.g. `ActionOf<Game[ \`controls\` ]>`. */
export type ActionOf<TControls> = TControls extends Controls<infer Action> ? Action : never

export default class Controls<Action extends string> {
  #bindings: Bindings<Action>

  constructor( bindings:Bindings<Action> ) {
    this.#bindings = structuredClone( bindings )
  }

  isHeld( action:Action ) {
    return Keys.isHeld( this.#bindings[ action ] )
  }

  isPressed( action:Action ) {
    return Keys.isPressed( this.#bindings[ action ] )
  }

  getAxis( negative:Action, positive:Action ) {
    return Number( this.isHeld( positive ) ) - Number( this.isHeld( negative ) )
  }

  runPressedHandlers( handlers:ActionHandlers<Action> ) {
    for (const action in handlers) {
      if (this.isPressed( action )) handlers[ action ]?.()
    }
  }

  getBindings( action:Action ) {
    return [ ...this.#bindings[ action ] ]
  }

  rebind( action:Action, codes:KeyCode[] ) {
    this.#bindings[ action ] = [ ...codes ]
  }
}
