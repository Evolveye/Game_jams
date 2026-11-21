import type Game from "../Game"
import type { Scene, SoundHandle } from "../logic/engine"
import type { Speaker } from "../logic/speakers"

/**
 * A line of a story. With a `speaker` it is said like in the game, without one it is narration.
 * `sound` is played with it instead of the speaker's voice.
 */
export type StoryLine = { text:string, speaker?:Speaker, sound?:string }

/** One picture of a story, with the lines told over it one by one. */
export type Shot = {
  /** URL of the picture, e.g. an image imported from `assets`. */
  image?: string
  title?: string
  /** Played when the shot appears, e.g. a jingle opening the story. */
  sound?: string
  lines: StoryLine[]
}

/** A line together with the shot it is told in. */
type Step = { shot:Shot, shotId:number, line:StoryLine }

/** A story told line by line over its pictures. Confirm (or a click) goes on, pause skips the rest. */
export default class SlidesScene implements Scene {
  /** Unique across scenes, so every line and picture plays its entrance, even in the next story. */
  static #nextId = 0

  #game: Game
  #steps: Step[]
  #onFinish: () => void
  #index = 0
  #isFinished = false
  /** The sound of the current line, cut off by the next one or when the story ends. */
  #voice: null | SoundHandle = null

  constructor( game:Game, story:Shot[], onFinish:() => void ) {
    this.#game = game
    this.#steps = story.flatMap( shot => {
      const shotId = SlidesScene.#nextId++
      return shot.lines.map( line => ({ shot, shotId, line }) )
    } )
    this.#onFinish = onFinish
  }

  enter() {
    if (!this.#steps.length) return this.#finish()

    this.#show()
  }

  exit() {
    this.#voice?.stop()
  }

  update() {
    const { controls } = this.#game

    if (controls.isPressed( `pause` )) this.#finish()
    else if (controls.isPressed( `confirm` )) this.next()
  }

  next() {
    if (this.#index >= this.#steps.length - 1) return this.#finish()

    this.#index++
    this.#show()
  }

  #finish() {
    if (this.#isFinished) return

    this.#isFinished = true
    this.#onFinish()
  }

  #show() {
    const { controls } = this.#game
    const { shot, shotId, line } = this.#steps[ this.#index ]
    const { text, speaker, sound = speaker?.voice } = line
    const isNewShot = this.#steps[ this.#index - 1 ]?.shotId !== shotId

    if (isNewShot && shot.sound) this.#game.sounds.play( shot.sound )

    this.#voice?.stop()
    this.#voice = sound ? this.#game.sounds.play( sound, { rateVariation:0.08 } ) : null

    this.#game.view.setScreen({
      kind: `slide`,
      id: SlidesScene.#nextId++,
      shotId,
      image: shot.image,
      title: shot.title,
      speech: speaker ? { text, label:speaker.name, color:speaker.color } : { text, variant:`narration` },
      progress: `${this.#index + 1} / ${this.#steps.length}`,
      hint: `${controls.getKeyLabel( `confirm` )} — dalej · ${controls.getKeyLabel( `pause` )} — pomiń`,
      onNext: () => this.next(),
    })
  }
}
