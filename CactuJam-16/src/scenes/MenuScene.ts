import type Game from "../Game"
import type { Scene } from "../logic/engine"
import OptionsMenu from "./OptionsMenu"

/** The main menu, covering the whole game. */
export default class MenuScene implements Scene {
  #game: Game
  #menu: OptionsMenu

  constructor( game:Game ) {
    this.#game = game
    this.#menu = new OptionsMenu([
      { label:`Nowa gra`, variant:`primary`, action:() => game.startNewRun() },
    ], () => this.#show() )
  }

  enter() {
    this.#show()
  }

  update() {
    this.#menu.update( this.#game )
  }

  #show() {
    this.#game.view.setScreen({
      kind: `menu`,
      ...this.#menu.getScreen({
        title: `To MOJA piaskownica!`,
        subtitle: `Gra na CactuJam 16`,
        hint: this.#menu.getHint( this.#game ),
      }),
    })
  }
}
