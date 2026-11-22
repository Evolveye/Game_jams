import type Game from "../Game"
import type { Scene } from "../logic/engine"
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

  /** `selectedEntry`: the entry selected at first (the first one when this menu has no such entry). */
  constructor( game:Game, selectedEntry?:MenuEntry ) {
    const entries = this.#createEntries( game )

    this.#game = game
    this.#menu = new OptionsMenu( game, entries, () => this.#show(), { columns:2 } )
    this.#menu.selectedIndex = Math.max( 0, entries.findIndex( entry => entry.id === selectedEntry ) )
  }

  enter() {
    this.#show()
  }

  update() {
    this.#menu.update()
  }

  #createEntries( game:Game ): (MenuOption & { id:MenuEntry })[] {
    const { hasPlayed } = game.progress
    const startEntries: (MenuOption & { id:MenuEntry })[] = hasPlayed
      ? [
        { id:`continue`, label:`Kontynuuj`, variant:`primary`, action:() => game.continueRun() },
        { id:`chooseLevel`, label:`Wybierz poziom`, action:() => game.scenes.switchTo( new LevelSelectScene( game ) ) },
      ]
      : [
        { id:`newGame`, label:`Nowa gra`, variant:`primary`, isWide:true, action:() => game.startNewRun() },
      ]

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
