import type Game from "../Game"
import LEVELS from "../levels"
import { Keys, type Scene } from "../logic/engine"
import { SOUNDS } from "../logic/sounds"
import MenuScene from "./MenuScene"
import OptionsMenu from "./OptionsMenu"

/** Days in a row of the list; the way back takes a whole row below them. */
const COLUMNS = 2

/**
 * Choosing a day reached before, to play it again. The run starts there with the toys that day last began with,
 * and goes on to the next days as usual.
 */
export default class LevelSelectScene implements Scene {
  #game: Game
  #menu: OptionsMenu

  constructor( game:Game ) {
    const reachedDays = game.progress.getReachedDays()
    const days = reachedDays.map( index => ({
      label: `${index + 1}. ${LEVELS[ index ].name}`,
      action: () => game.startRunAt( index ),
    }) )

    this.#game = game
    this.#menu = new OptionsMenu( game, [
      ...days,
      { label:`Wróć`, isWide:true, action:() => this.#goBack() },
    ], () => this.#show(), { columns:COLUMNS } )

    // The day continued most recently is the likeliest choice.
    this.#menu.selectedIndex = Math.max( 0, reachedDays.indexOf( game.progress.lastDay?.index ?? -1 ) )
  }

  enter() {
    this.#show()
  }

  update() {
    if (Keys.isPressed([ `Escape` ])) {
      this.#game.sounds.play( SOUNDS.menuConfirm )
      return this.#goBack()
    }

    this.#menu.update()
  }

  #goBack() {
    this.#game.scenes.switchTo( new MenuScene( this.#game, `chooseLevel` ) )
  }

  #show() {
    this.#game.view.setScreen({
      kind: `menu`,
      ...this.#menu.getScreen({
        title: `Wybierz poziom`,
        subtitle: `Zaczynasz z zabawkami, które miałeś na początku tego dnia.`,
        hint: `${this.#menu.getHint()} · Esc — wróć`,
      }),
    })
  }
}
