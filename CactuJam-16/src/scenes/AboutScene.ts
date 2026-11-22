import type Game from "../Game"
import { Keys, type Scene } from "../logic/engine"
import { SOUNDS } from "../logic/sounds"
import MenuScene, { MENU_ENTRIES } from "./MenuScene"

/** About the game (credits), opened from the main menu. Its text lives in `AboutScreen.svelte`. */
export default class AboutScene implements Scene {
  #game: Game

  constructor( game:Game ) {
    this.#game = game
  }

  enter() {
    const { controls } = this.#game

    this.#game.view.setScreen({
      kind: `about`,
      hint: `${controls.getKeyLabel( `confirm` )} / Esc — wróć`,
      onBack: () => this.#goBack(),
    })
  }

  update() {
    if (this.#game.controls.isPressed( `confirm` ) || Keys.isPressed([ `Escape` ])) this.#goBack()
  }

  #goBack() {
    this.#game.sounds.play( SOUNDS.menuConfirm )
    this.#game.scenes.switchTo( new MenuScene( this.#game, MENU_ENTRIES.about ) )
  }
}
