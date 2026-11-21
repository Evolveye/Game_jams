import type Game from "../Game"
import type { Scene } from "../logic/engine"
import type GameplayScene from "./GameplayScene"
import MenuScene from "./MenuScene"
import OptionsMenu from "./OptionsMenu"

/** Pause menu over the frozen gameplay, which stays visible below it. */
export default class PauseScene implements Scene {
  isOverlay = true

  #game: Game
  #menu: OptionsMenu

  constructor( game:Game, gameplay:GameplayScene ) {
    this.#game = game
    this.#menu = new OptionsMenu([
      { label:`Wznów`, action:() => game.scenes.closeOverlay() },
      { label:`Zacznij dzień od nowa`, action:() => gameplay.restartDay() },
      { label:`Menu główne`, action:() => game.scenes.switchTo( new MenuScene( game ) ) },
    ], () => this.#show() )
  }

  enter() {
    this.#show()
  }

  exit() {
    this.#game.view.setOverlay( null )
  }

  update() {
    // The pause key closes the menu again.
    if (this.#game.controls.isPressed( `pause` )) return this.#game.scenes.closeOverlay()
    this.#menu.update( this.#game )
  }

  #show() {
    const { controls } = this.#game

    this.#game.view.setOverlay( this.#menu.getScreen({
      title: `Pauza`,
      hint: `${this.#menu.getHint( this.#game )} · ${controls.getKeyLabel( `pause` )} — wznów`,
    }) )
  }
}
