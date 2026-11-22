import type Game from "../Game"
import type { GameStats } from "../Game"
import Inventory from "../entities/items/Inventory"
import type { ItemKind } from "../entities/items/items"
import LEVELS from "../levels"
import type { Scene } from "../logic/engine"
import GameOverScene from "./GameOverScene"
import PauseScene from "./PauseScene"

/** The day lost by running out of hearts. */
const HEARTS_LOST = { title:`Ała!`, subtitle:`Mama zabrała cię do domu.` }

/** What the day started with, so it can be played again from the start. */
type DayStart = { inventory:ItemKind[], stats:GameStats }

/** One day being played: runs its level script, the world and the player. Pause opens the pause menu. */
export default class GameplayScene implements Scene {
  #game: Game
  #levelIndex: number
  #dayStart: DayStart

  constructor( game:Game, levelIndex:number ) {
    this.#game = game
    this.#levelIndex = levelIndex
    this.#dayStart = { inventory:[], stats:{ ...game.stats } }
  }

  enter() {
    const game = this.#game
    const level = LEVELS[ this.#levelIndex ]

    this.#dayStart = {
      inventory: game.player.inventory.items.map( item => item.kind ),
      stats: { ...game.stats },
    }

    // Every day starts with full health.
    game.player.health.fill()

    game.view.setScreen( null )
    game.level = level

    level.run( game ).then( isCompleted => {
      if (!isCompleted) return

      game.stats.daysCompleted++
      game.startDay( this.#levelIndex + 1 )
    } )
  }

  exit() {
    this.#game.level?.abort()
    this.#game.level = null
    this.#game.view.setSpeech( null )
  }

  update( seconds:number ) {
    const game = this.#game
    if (game.controls.isPressed( `pause` )) return game.scenes.openOverlay( new PauseScene( game, this ) )

    game.updateWorld( seconds )

    // Out of hearts, or lost by the level (e.g. a crying baby): the world freezes below the summary.
    const loss = game.player.health.isEmpty ? HEARTS_LOST : game.level?.loss
    if (loss) game.scenes.openOverlay( new GameOverScene( game, loss.title, loss.subtitle, { label:`Zacznij dzień od nowa`, action:() => this.restartDay() } ) )
  }

  draw() {
    this.#game.drawWorld()
  }

  /** Plays the day again from its start, with the inventory and stats it began with. */
  restartDay() {
    const game = this.#game

    game.player.inventory = new Inventory( this.#dayStart.inventory, game.player.inventory.toyLimit )
    game.stats = { ...this.#dayStart.stats }
    game.startDay( this.#levelIndex, { withStory:false } )
  }
}
