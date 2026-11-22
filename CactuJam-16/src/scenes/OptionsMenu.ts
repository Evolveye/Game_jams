import type Game from "../Game"
import type { MenuScreenData, MenuScreenOption } from "../components/MenuScreen.svelte"
import { SOUNDS } from "../logic/sounds"

/** One menu entry: how it looks (label, button variant, full width) and what picking it does. */
export type MenuOption = MenuScreenOption & { action:() => void }

/** Everything a menu shows besides its options. */
export type MenuTexts = Pick<MenuScreenData, `title` | `subtitle` | `rows` | `hint`>

/**
 * Options picked with the keyboard (arrows, confirm) or the mouse, shared by all menu scenes.
 * Laid out in rows of up to `columns` options; a wide option takes a whole row. Up and down move between rows
 * (keeping the column when they can), left and right within a row.
 */
export default class OptionsMenu {
  options: MenuOption[]
  selectedIndex = 0
  columns: number
  #game: Game
  #onChange: () => void

  /** `onChange` is called whenever the view needs updating (the selection moved). */
  constructor( game:Game, options:MenuOption[], onChange:() => void, { columns = 1 } = {} ) {
    this.#game = game
    this.options = options
    this.columns = columns
    this.#onChange = onChange
  }

  /** Reads the keyboard; call once per frame. */
  update() {
    const { controls } = this.#game

    if (controls.isPressed( `moveUp` )) this.#moveBy( -1, 0 )
    if (controls.isPressed( `moveDown` )) this.#moveBy( 1, 0 )
    if (controls.isPressed( `moveLeft` )) this.#moveBy( 0, -1 )
    if (controls.isPressed( `moveRight` )) this.#moveBy( 0, 1 )
    if (controls.isPressed( `confirm` )) this.pick( this.selectedIndex )
  }

  pick( index:number ) {
    const option = this.options[ index ]
    if (!option) return

    this.#game.sounds.play( SOUNDS.menuConfirm )
    option.action()
  }

  /** Data for the menu view. */
  getScreen( texts:MenuTexts ): MenuScreenData {
    return {
      ...texts,
      options: this.options.map( ({ label, variant, isWide }) => ({ label, variant, isWide }) ),
      selectedIndex: this.selectedIndex,
      columns: this.columns,
      onSelect: index => this.pick( index ),
      onHover: index => this.#select( index ),
    }
  }

  /** Keys for moving through the menu, as a hint under it. */
  getHint() {
    const { controls } = this.#game
    const hasSideBySide = this.#getRows().some( row => row.length > 1 )
    const moves = hasSideBySide ? controls.getKeyLabel( `moveUp`, `moveLeft`, `moveDown`, `moveRight` ) : controls.getKeyLabel( `moveUp`, `moveDown` )

    return `${moves} — wybór · ${controls.getKeyLabel( `confirm` )} — zatwierdź`
  }

  /** Option indexes grouped in rows, as the view lays them out. */
  #getRows() {
    const rows: number[][] = []

    this.options.forEach( (option, index) => {
      const lastRow = rows.at( -1 )
      const hasRoom = lastRow && lastRow.length < this.columns && !this.options[ lastRow[ 0 ] ].isWide

      if (lastRow && hasRoom && !option.isWide) lastRow.push( index )
      else rows.push([ index ])
    } )

    return rows
  }

  /** Moves the selection by rows and columns, wrapping around the ends. */
  #moveBy( rowStep:number, columnStep:number ) {
    const rows = this.#getRows()
    const rowIndex = rows.findIndex( row => row.includes( this.selectedIndex ) )
    const column = rows[ rowIndex ].indexOf( this.selectedIndex )

    const targetRow = rows[ (rowIndex + rowStep + rows.length) % rows.length ]
    const targetColumn = rowStep ? Math.min( column, targetRow.length - 1 ) : (column + columnStep + targetRow.length) % targetRow.length

    this.#select( targetRow[ targetColumn ] )
  }

  #select( index:number ) {
    if (index === this.selectedIndex) return

    this.selectedIndex = index
    this.#game.sounds.play( SOUNDS.menuMove )
    this.#onChange()
  }
}
