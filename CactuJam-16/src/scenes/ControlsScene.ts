import type Game from "../Game"
import { bindKey, clearKey, getActionLabel, REBINDABLE_ACTIONS, resetBindings, SLOTS_PER_ACTION } from "../logic/bindings"
import { Keys, type KeyCode, type Scene } from "../logic/engine"
import { SOUNDS } from "../logic/sounds"
import MenuScene, { MENU_ENTRIES } from "./MenuScene"

/** A key slot waiting for the player's next key or mouse button; aborting stops listening to the mouse. */
type Waiting = { row:number, slot:number, abortCtrl:AbortController }

/** Options below the keys, as the last row of the grid (one per column). */
const OPTIONS = [ { label:`Przywróć domyślne` }, { label:`Wróć`, variant:`primary` as const } ]

/** Keys with a fixed meaning here, so a bad binding can never lock the player in this view. */
const BACK_KEYS:KeyCode[] = [ `Escape` ]
const CLEAR_KEYS:KeyCode[] = [ `Delete`, `Backspace` ]

/**
 * Redefining the controls: a grid of actions × key slots, with the options as its last row. Picking a slot waits for
 * a key or mouse button and binds it (see `bindKey`); keys are saved in the browser.
 */
export default class ControlsScene implements Scene {
  #game: Game
  #row = 0
  #column = 0
  #waiting: null | Waiting = null
  #message: null | string = null

  constructor( game:Game ) {
    this.#game = game
  }

  get #optionsRow() {
    return REBINDABLE_ACTIONS.length
  }

  enter() {
    this.#show()
  }

  exit() {
    this.#waiting?.abortCtrl.abort()
  }

  update() {
    if (this.#waiting) return this.#listenForKey()

    const { controls } = this.#game

    if (Keys.isPressed( BACK_KEYS )) return this.#goBack()
    if (Keys.isPressed( CLEAR_KEYS )) return this.#clearSelectedSlot()

    if (controls.isPressed( `moveUp` )) this.#select( this.#row - 1, this.#column )
    if (controls.isPressed( `moveDown` )) this.#select( this.#row + 1, this.#column )
    if (controls.isPressed( `moveLeft` )) this.#select( this.#row, this.#column - 1 )
    if (controls.isPressed( `moveRight` )) this.#select( this.#row, this.#column + 1 )
    if (controls.isPressed( `confirm` )) this.#pick( this.#row, this.#column )
  }

  /** Picks a cell: a key slot starts waiting for a key, an option runs. */
  #pick( row:number, column:number ) {
    this.#game.sounds.play( SOUNDS.menuConfirm )
    this.#row = row
    this.#column = column

    if (row === this.#optionsRow) return column === 0 ? this.#resetAll() : this.#goBack()

    const abortCtrl = new AbortController()

    this.#waiting = { row, slot:column, abortCtrl }
    this.#message = null
    Keys.waitForPointerInput( abortCtrl.signal ).then( code => this.#finishWaiting( code ) )

    this.#show()
  }

  /** While waiting: the first key pressed binds, Escape cancels. */
  #listenForKey() {
    const [ code ] = Keys.getPressedCodes()
    if (!code) return

    this.#finishWaiting( BACK_KEYS.includes( code ) ? null : code )
  }

  /** Binds the key to the waiting slot (`null` cancels). */
  #finishWaiting( code:null | KeyCode ) {
    const waiting = this.#waiting
    if (!waiting) return

    waiting.abortCtrl.abort()
    this.#waiting = null

    if (code) {
      const { action } = REBINDABLE_ACTIONS[ waiting.row ]
      const keylessAction = bindKey( this.#game.controls, action, waiting.slot, code )

      if (keylessAction) this.#message = `${Keys.getLabel( code )} to jedyny klawisz akcji „${getActionLabel( keylessAction )}”. Najpierw daj jej inny.`
      else this.#game.sounds.play( SOUNDS.pickup )
    }

    this.#show()
  }

  #clearSelectedSlot() {
    if (this.#row === this.#optionsRow) return

    const { action } = REBINDABLE_ACTIONS[ this.#row ]
    if (this.#game.controls.getBindings( action )[ this.#column ] === undefined) return

    const isCleared = clearKey( this.#game.controls, action, this.#column )

    this.#message = isCleared ? null : `Każda akcja musi mieć choć jeden klawisz.`
    this.#show()
  }

  #resetAll() {
    resetBindings( this.#game.controls )
    this.#message = `Przywrócono domyślne klawisze.`
    this.#show()
  }

  #goBack() {
    this.#game.sounds.play( SOUNDS.menuConfirm )
    this.#game.scenes.switchTo( new MenuScene( this.#game, MENU_ENTRIES.controls ) )
  }

  /** Selects a cell, wrapping around the grid's edges. */
  #select( row:number, column:number ) {
    if (this.#waiting) return

    const rowsCount = this.#optionsRow + 1
    const wrappedRow = (row + rowsCount) % rowsCount
    const wrappedColumn = (column + SLOTS_PER_ACTION) % SLOTS_PER_ACTION
    if (wrappedRow === this.#row && wrappedColumn === this.#column) return

    this.#row = wrappedRow
    this.#column = wrappedColumn
    this.#game.sounds.play( SOUNDS.menuMove )
    this.#show()
  }

  #show() {
    const { controls } = this.#game
    const waiting = this.#waiting
    const isOptionsRow = this.#row === this.#optionsRow

    const rows = REBINDABLE_ACTIONS.map( ({ action, label }, row) => {
      const codes = controls.getBindings( action )
      const slots = Array.from({ length:SLOTS_PER_ACTION }, (_, slot) => ({
        keyLabel: codes[ slot ] === undefined ? null : Keys.getLabel( codes[ slot ] ),
        isSelected: row === this.#row && slot === this.#column,
        isWaiting: waiting?.row === row && waiting.slot === slot,
      }) )

      return { action, label, slots }
    } )

    const hint = waiting
      ? `Naciśnij klawisz lub przycisk myszy · Esc — anuluj`
      : `${controls.getKeyLabel( `moveUp`, `moveLeft`, `moveDown`, `moveRight` )} — wybór · ${controls.getKeyLabel( `confirm` )} — zmień · Del — usuń · Esc — wróć`

    this.#game.view.setScreen({
      kind: `controls`,
      rows,
      options: OPTIONS.map( (option, column) => ({ ...option, isSelected:isOptionsRow && column === this.#column }) ),
      message: this.#message,
      hint,
      onSlotSelect: (row, slot) => {
        if (!this.#waiting) this.#pick( row, slot )
      },
      onSlotHover: (row, slot) => this.#select( row, slot ),
      onOptionSelect: column => this.#pick( this.#optionsRow, column ),
      onOptionHover: column => this.#select( this.#optionsRow, column ),
    })
  }
}
