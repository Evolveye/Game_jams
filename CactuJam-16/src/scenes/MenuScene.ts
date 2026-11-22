import type Game from "../Game"
import type { Scene } from "../logic/engine"
import { MUSIC } from "../logic/sounds"
import AboutScene from "./AboutScene"
import AchievementsScene from "./AchievementsScene"
import ConfirmScene from "./ConfirmScene"
import ControlsScene from "./ControlsScene"
import LevelSelectScene from "./LevelSelectScene"
import OptionsMenu, { type MenuOption } from "./OptionsMenu"

/** The main menu's entries, so a view opened from it comes back to its own entry. */
export type MenuEntry = `newGame` | `continue` | `chooseLevel` | `achievements` | `controls` | `about` | `clearData`

/**
 * The main menu, covering the whole game. A player who has played before continues or chooses a reached day
 * (side by side) instead of starting a new game, and can delete the saved data.
 */
export default class MenuScene implements Scene {
  #game: Game
  #menu: OptionsMenu
  #entries: (MenuOption & { id:MenuEntry })[]
  /** Debug mode when the menu was built: it shows more options (see `#createEntries`). */
  #isDebug: boolean

  /** `selectedEntry`: the entry selected at first (the first one when this menu has no such entry). */
  constructor( game:Game, selectedEntry?:MenuEntry ) {
    const entries = this.#createEntries( game )

    this.#game = game
    this.#entries = entries
    this.#isDebug = game.isDebug
    this.#menu = new OptionsMenu( game, entries, () => this.#show(), { columns:2 } )
    this.#menu.selectedIndex = Math.max( 0, entries.findIndex( entry => entry.id === selectedEntry ) )
  }

  enter() {
    // The screens opened from the menu keep its song going.
    this.#game.sounds.playMusic( MUSIC.calm )
    this.#show()
  }

  update() {
    const game = this.#game

    // Debug mode switched from the console: rebuilt with the same entry selected.
    if (game.isDebug !== this.#isDebug) return game.scenes.switchTo( new MenuScene( game, this.#entries[ this.#menu.selectedIndex ]?.id ) )

    this.#menu.update()
  }

  #createEntries( game:Game ): (MenuOption & { id:MenuEntry })[] {
    const { hasPlayed } = game.progress
    const continueRun:MenuOption & { id:MenuEntry } = { id:`continue`, label:`Kontynuuj`, variant:`primary`, action:() => game.continueRun() }
    const chooseLevel:MenuOption & { id:MenuEntry } = { id:`chooseLevel`, label:`Wybierz poziom`, action:() => game.scenes.switchTo( new LevelSelectScene( game ) ) }
    const newGame:MenuOption & { id:MenuEntry } = { id:`newGame`, label:`Nowa gra`, variant:`primary`, action:() => game.startNewRun() }

    // A new player starts a new game; in debug mode any day can be chosen too, also before playing.
    let startEntries = [ { ...newGame, isWide:true } ]
    if (hasPlayed) startEntries = [ continueRun, chooseLevel ]
    else if (game.isDebug) startEntries = [ newGame, chooseLevel ]

    const entries: (MenuOption & { id:MenuEntry })[] = [
      ...startEntries,
      { id:`achievements`, label:`Osiągnięcia`, isWide:true, action:() => game.scenes.switchTo( new AchievementsScene( game ) ) },
      { id:`controls`, label:`Sterowanie`, isWide:true, action:() => game.scenes.switchTo( new ControlsScene( game ) ) },
      { id:`about`, label:`O grze`, isWide:true, action:() => game.scenes.switchTo( new AboutScene( game ) ) },
    ]

    if (hasPlayed) entries.push({ id:`clearData`, label:`Wyczyść dane gry`, variant:`danger`, isWide:true, action:() => this.#confirmClearing( game ) })

    return entries
  }

  /** Asks first; after deleting, the menu starts over as for a new player. */
  #confirmClearing( game:Game ) {
    game.scenes.switchTo( new ConfirmScene( game, {
      title: `Wyczyścić dane gry?`,
      subtitle: `Stracisz postęp (zapisane dni) i osiągnięcia. Tego nie da się cofnąć.`,
      confirmLabel: `Wyczyść`,
      onConfirm: () => {
        game.clearSavedData()
        game.scenes.switchTo( new MenuScene( game ) )
      },
      onCancel: () => game.scenes.switchTo( new MenuScene( game, `clearData` ) ),
    } ) )
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
