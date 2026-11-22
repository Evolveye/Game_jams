import type Game from "../Game"
import { Keys, type Scene } from "../logic/engine"
import { SOUNDS } from "../logic/sounds"
import MenuScene from "./MenuScene"

/** The player's achievements, opened from the main menu. */
export default class AchievementsScene implements Scene {
  #game: Game

  constructor( game:Game ) {
    this.#game = game
  }

  enter() {
    const { controls } = this.#game
    const achievements = this.#game.achievements.getList().map( ({ id, name, description, unlockedAt }) => ({
      id,
      name,
      description,
      unlockedAt: unlockedAt === null ? null : new Date( unlockedAt ).toLocaleDateString( `pl-PL` ),
    }) )

    this.#game.view.setScreen({
      kind: `achievements`,
      achievements,
      hint: `${controls.getKeyLabel( `confirm` )} / Esc — wróć`,
      onBack: () => this.#goBack(),
    })
  }

  update() {
    if (this.#game.controls.isPressed( `confirm` ) || Keys.isPressed([ `Escape` ])) this.#goBack()
  }

  #goBack() {
    this.#game.sounds.play( SOUNDS.menuConfirm )
    this.#game.scenes.switchTo( new MenuScene( this.#game, `achievements` ) )
  }
}
