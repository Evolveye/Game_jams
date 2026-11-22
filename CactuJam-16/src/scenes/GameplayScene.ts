import type Game from "../Game"
import Inventory from "../entities/items/Inventory"
import LEVELS from "../levels"
import AchievementTracker from "../logic/AchievementTracker"
import type { Scene } from "../logic/engine"
import type { DayStart } from "../logic/progress"
import { SOUNDS } from "../logic/sounds"
import { copyStats } from "../logic/stats"
import GameOverScene from "./GameOverScene"
import PauseScene from "./PauseScene"

/** The day lost by running out of hearts. */
const HEARTS_LOST = { title:`Ała!`, subtitle:`Mama zabrała cię do domu.` }

/** One day being played: runs its level script, the world and the player. Pause opens the pause menu. */
export default class GameplayScene implements Scene {
  #game: Game
  #levelIndex: number
  #dayStart: DayStart

  constructor( game:Game, levelIndex:number ) {
    this.#game = game
    this.#levelIndex = levelIndex
    this.#dayStart = { inventory:[], stats:copyStats( game.stats ) }
  }

  enter() {
    const game = this.#game
    const level = LEVELS[ this.#levelIndex ]

    this.#dayStart = {
      inventory: game.player.inventory.items.map( item => item.kind ),
      stats: copyStats( game.stats ),
    }
    game.progress.saveDayStart( this.#levelIndex, this.#dayStart )

    // Every day starts with full health.
    game.player.health.fill()

    game.view.setScreen( null )
    game.level = level

    // A jingle to start, then the day's song.
    game.sounds.play( SOUNDS.dayStart )
    game.sounds.playMusic( level.music )

    level.run( game ).then( isCompleted => {
      if (!isCompleted) return

      game.stats.daysCompleted++
      game.startDay( this.#levelIndex + 1 )
    } )

    // Started after the level, so everything it listens to stops with this day.
    new AchievementTracker( game, level, this.#levelIndex )

    // A crying baby counts for the whole run: kept even when the day is played again from its start.
    level.on( `babyCried`, () => {
      game.stats.babiesCried++
      this.#dayStart.stats.babiesCried++
      game.progress.saveDayStart( this.#levelIndex, this.#dayStart )
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
    if (!loss) return

    game.sounds.stopMusic( 0.3 )
    game.sounds.play( SOUNDS.dayLost )
    game.scenes.openOverlay( new GameOverScene( game, loss.title, loss.subtitle, { label:`Zacznij dzień od nowa`, action:() => this.restartDay() } ) )
  }

  draw() {
    this.#game.drawWorld()
  }

  /** Plays the day again from its start, with the inventory and stats it began with. */
  restartDay() {
    const game = this.#game

    game.player.inventory = new Inventory( this.#dayStart.inventory, game.player.inventory.toyLimit )
    game.stats = copyStats( this.#dayStart.stats )
    game.startDay( this.#levelIndex, { withStory:false } )
  }
}
