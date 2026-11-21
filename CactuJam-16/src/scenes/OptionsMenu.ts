import type Game from "../Game"
import type { MenuScreenData, MenuScreenOption } from "../components/MenuScreen.svelte"
import { SOUNDS } from "../logic/sounds"

/** One menu entry: how it looks (label, button variant) and what picking it does. */
export type MenuOption = MenuScreenOption & { action:() => void }

/** Everything a menu shows besides its options. */
export type MenuTexts = Pick<MenuScreenData, `title` | `subtitle` | `rows` | `hint`>

/** Options picked with the keyboard (up, down, confirm) or the mouse, shared by all menu scenes. */
export default class OptionsMenu {
  options: MenuOption[]
  selectedIndex = 0
  #game: Game
  #onChange: () => void

  /** `onChange` is called whenever the view needs updating (the selection moved). */
  constructor( game:Game, options:MenuOption[], onChange:() => void ) {
    this.#game = game
    this.options = options
    this.#onChange = onChange
  }

  /** Reads the keyboard; call once per frame. */
  update() {
    const { controls } = this.#game

    if (controls.isPressed( `moveUp` )) this.#select( this.selectedIndex - 1 )
    if (controls.isPressed( `moveDown` )) this.#select( this.selectedIndex + 1 )
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
      options: this.options.map( ({ label, variant }) => ({ label, variant }) ),
      selectedIndex: this.selectedIndex,
      onSelect: index => this.pick( index ),
      onHover: index => this.#select( index ),
    }
  }

  /** Keys for moving through the menu, as a hint under it. */
  getHint() {
    const { controls } = this.#game
    return `${controls.getKeyLabel( `moveUp`, `moveDown` )} — wybór · ${controls.getKeyLabel( `confirm` )} — zatwierdź`
  }

  /** Selects an option, wrapping around the ends. */
  #select( index:number ) {
    const count = this.options.length
    const wrappedIndex = (index + count) % count
    if (wrappedIndex === this.selectedIndex) return

    this.selectedIndex = wrappedIndex
    this.#game.sounds.play( SOUNDS.menuMove )
    this.#onChange()
  }
}
