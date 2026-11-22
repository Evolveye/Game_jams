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
 * and goes on to the next days as usual. In debug mode every day is listed; one not reached yet starts with bare fists.
 */
export default class LevelSelectScene implements Scene {
  #game: Game
  #menu: OptionsMenu
  /** Debug mode when the list was built: it lists every day. */
  #isDebug: boolean

  constructor( game:Game ) {
    // In debug mode every day is listed; those not reached yet are marked as debug-only.
    const reachedDays = game.progress.getReachedDays()
    const listedDays = game.isDebug ? LEVELS.map( (_, index) => index ) : reachedDays
    const days = listedDays.map( index => ({
      label: `${index + 1}. ${LEVELS[ index ].name}`,
      variant: reachedDays.includes( index ) ? undefined : `debug` as const,
      action: () => game.startRunAt( index ),
    }) )

    this.#game = game
    this.#isDebug = game.isDebug
    this.#menu = new OptionsMenu( game, [
      ...days,
      { label:`Wróć`, isWide:true, action:() => this.#goBack() },
    ], () => this.#show(), { columns:COLUMNS } )

    // The day continued most recently is the likeliest choice.
    this.#menu.selectedIndex = Math.max( 0, listedDays.indexOf( game.progress.lastDay?.index ?? -1 ) )
  }

  enter() {
    this.#show()
  }

  update() {
    // Debug mode switched from the console: the list is built again.
    if (this.#game.isDebug !== this.#isDebug) return this.#game.scenes.switchTo( new LevelSelectScene( this.#game ) )

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
        subtitle: this.#game.isDebug
          ? `Zaczynasz z zabawkami, które miałeś na początku tego dnia.\nPrzerywane: dni jeszcze nieodkryte, dostępne w trybie debug (tylko z pięściami).`
          : `Zaczynasz z zabawkami, które miałeś na początku tego dnia.`,
        hint: `${this.#menu.getHint()} · Esc — wróć`,
      }),
    })
  }
}
