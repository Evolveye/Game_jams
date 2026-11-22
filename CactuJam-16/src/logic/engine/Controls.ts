import Keys, { type KeyCode } from "./Keys"

export type Bindings<Action extends string> = Record<Action, KeyCode[]>
export type ActionHandlers<Action extends string> = Partial<Record<Action, () => void>>

/** Action names of a `Controls` instance type, e.g. `ActionOf<Game[ \`controls\` ]>`. */
export type ActionOf<TControls> = TControls extends Controls<infer Action> ? Action : never

export default class Controls<Action extends string> {
  #bindings: Bindings<Action>
  #defaults: Bindings<Action>

  constructor( bindings:Bindings<Action> ) {
    this.#defaults = structuredClone( bindings )
    this.#bindings = structuredClone( bindings )

    // Game keys must not trigger browser actions (scrolling, Ctrl+S, …).
    for (const codes of Object.values<KeyCode[]>( this.#bindings )) Keys.blockDefault( codes )
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

  getKeyLabel( ...actions:Action[] ) {
    return this.getKeyLabels( ...actions ).join( ` / ` )
  }

  /** Key labels grouped by binding position, e.g. the moves give `[ "WASD", "↑←↓→" ]`. */
  getKeyLabels( ...actions:Action[] ) {
    const positionsCount = Math.max( ...actions.map( action => this.#bindings[ action ].length ) )
    const positions = Array.from({ length:positionsCount }, (_, position) => {
      const codes = actions.map( action => this.#bindings[ action ][ position ] ).filter( code => code !== undefined )
      return codes.map( code => Keys.getLabel( code ) ).join( `` )
    } )

    // Two keys with the same label (left and right Shift) are shown once.
    return [ ...new Set( positions ) ]
  }

  getBindings( action:Action ) {
    return [ ...this.#bindings[ action ] ]
  }

  rebind( action:Action, codes:KeyCode[] ) {
    this.#bindings[ action ] = [ ...codes ]
    Keys.blockDefault( codes )
  }

  /** A copy of every binding, e.g. to save it. */
  getAllBindings() {
    return structuredClone( this.#bindings )
  }

  /** The bindings the controls were created with. */
  getDefaultBindings( action:Action ) {
    return [ ...this.#defaults[ action ] ]
  }

  /** Rebinds the known actions found in `bindings` (e.g. loaded from storage); unknown actions are ignored. */
  rebindAll( bindings:Partial<Record<string, KeyCode[]>> ) {
    for (const action in this.#bindings) {
      const codes = bindings[ action ]
      if (Array.isArray( codes )) this.rebind( action, codes )
    }
  }

  resetBindings() {
    this.#bindings = structuredClone( this.#defaults )
  }
}
