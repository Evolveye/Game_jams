import type Game from "../Game"
import type { Scene } from "../logic/engine"
import MenuScene from "./MenuScene"
import OptionsMenu, { type MenuOption } from "./OptionsMenu"

/** End of a run (won, or lost on a day) with its summary, over the last frame of the gameplay. */
export default class GameOverScene implements Scene {
  isOverlay = true

  #game: Game
  #menu: OptionsMenu
  #title: string
  #subtitle: string

  /** `retry` is the main action (play the run or the day again), shown above the way back to the menu. */
  constructor( game:Game, title:string, subtitle:string, retry:Omit<MenuOption, `variant`> ) {
    this.#game = game
    this.#title = title
    this.#subtitle = subtitle
    this.#menu = new OptionsMenu([
      { ...retry, variant:`primary` },
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
    this.#menu.update( this.#game )
  }

  #show() {
    this.#game.view.setOverlay( this.#menu.getScreen({
      title: this.#title,
      subtitle: this.#subtitle,
      rows: this.#getSummary(),
      hint: this.#menu.getHint( this.#game ),
    }) )
  }

  #getSummary() {
    const { stats } = this.#game
    const minutes = Math.floor( stats.playSeconds / 60 )
    const seconds = Math.floor( stats.playSeconds % 60 ).toString().padStart( 2, `0` )

    return [
      { label:`Dni za tobą`, value:`${stats.daysCompleted}` },
      { label:`Przepędzone dzieci`, value:`${stats.kidsBeaten}` },
      { label:`Oberwałeś`, value:`${stats.hitsTaken}×` },
      { label:`Czas zabawy`, value:`${minutes}:${seconds}` },
    ]
  }
}
