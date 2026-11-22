import type Game from "../Game"
import { Keys, type Scene } from "../logic/engine"
import { SOUNDS } from "../logic/sounds"
import OptionsMenu from "./OptionsMenu"

/**
 * - `title`, `subtitle`: the question and what happens
 * - `confirmLabel`: the button doing it (shown as dangerous)
 * - `onConfirm`, `onCancel`: what each answer does, e.g. switching back to the previous scene
 */
export type ConfirmOptions = {
  title: string
  subtitle: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/** Asks before something that can't be undone. "Cancel" is selected at first, and Esc cancels too. */
export default class ConfirmScene implements Scene {
  #game: Game
  #menu: OptionsMenu
  #options: ConfirmOptions

  constructor( game:Game, options:ConfirmOptions ) {
    this.#game = game
    this.#options = options
    this.#menu = new OptionsMenu( game, [
      { label:`Anuluj`, action:options.onCancel },
      { label:options.confirmLabel, variant:`danger`, action:options.onConfirm },
    ], () => this.#show(), { columns:2 } )
  }

  enter() {
    this.#show()
  }

  update() {
    if (Keys.isPressed([ `Escape` ])) {
      this.#game.sounds.play( SOUNDS.menuConfirm )
      return this.#options.onCancel()
    }

    this.#menu.update()
  }

  #show() {
    this.#game.view.setScreen({
      kind: `menu`,
      ...this.#menu.getScreen({
        title: this.#options.title,
        subtitle: this.#options.subtitle,
        hint: `${this.#menu.getHint()} · Esc — anuluj`,
      }),
    })
  }
}
