import type Game from "../Game"
import type { Scene } from "../logic/engine"
import AboutScene from "./AboutScene"
import AchievementsScene from "./AchievementsScene"
import ControlsScene from "./ControlsScene"
import OptionsMenu from "./OptionsMenu"

/** Positions of the main menu's entries, so a view opened from it comes back to its own entry. */
export const MENU_ENTRIES = { newGame:0, achievements:1, controls:2, about:3 }

/** The main menu, covering the whole game. */
export default class MenuScene implements Scene {
  #game: Game
  #menu: OptionsMenu

  constructor( game:Game, selectedIndex = MENU_ENTRIES.newGame ) {
    this.#game = game
    this.#menu = new OptionsMenu( game, [
      { label:`Nowa gra`, variant:`primary`, action:() => game.startNewRun() },
      { label:`Osiągnięcia`, action:() => game.scenes.switchTo( new AchievementsScene( game ) ) },
      { label:`Sterowanie`, action:() => game.scenes.switchTo( new ControlsScene( game ) ) },
      { label:`O grze`, action:() => game.scenes.switchTo( new AboutScene( game ) ) },
    ], () => this.#show() )
    this.#menu.selectedIndex = selectedIndex
  }

  enter() {
    this.#show()
  }

  update() {
    this.#menu.update()
  }

  #show() {
    this.#game.view.setScreen({
      kind: `menu`,
      ...this.#menu.getScreen({
        title: `To MOJA piaskownica!`,
        subtitle: `Gra na CactuJam 16`,
        hint: this.#menu.getHint(),
      }),
    })
  }
}
