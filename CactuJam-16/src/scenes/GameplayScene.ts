import type Game from "../Game"
import type { GameStats } from "../Game"
import Inventory from "../entities/items/Inventory"
import type { ItemKind } from "../entities/items/items"
import LEVELS from "../levels"
import type { Scene } from "../logic/engine"
import PauseScene from "./PauseScene"

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
    if (this.#game.controls.isPressed( `pause` )) return this.#game.scenes.openOverlay( new PauseScene( this.#game, this ) )
    this.#game.updateWorld( seconds )
  }

  draw() {
    this.#game.drawWorld()
  }

  /** Plays the day again from its start, with the inventory and stats it began with. */
  restartDay() {
    const game = this.#game

    game.player.inventory = new Inventory( this.#dayStart.inventory )
    game.stats = { ...this.#dayStart.stats }
    game.startDay( this.#levelIndex, { withStory:false } )
  }
}
