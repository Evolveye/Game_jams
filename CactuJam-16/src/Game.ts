import { flushSync, mount } from "svelte"
import playgroundImage from "./assets/sprites/playground.png"
import GameView from "./components/Game.svelte"
import { ITEMS, type ItemKind, type ToyKind } from "./entities/items/items"
import type Kid from "./entities/kids/Kid"
import Player, { HEART_ICONS } from "./entities/Player"
import LEVELS from "./levels"
import Achievements, { ACHIEVEMENTS, type AchievementId } from "./logic/achievements"
import { loadSavedBindings } from "./logic/bindings"
import type Level from "./logic/Level"
import { SOUNDS } from "./logic/sounds"
import type { Speaker } from "./logic/speakers"
import { WORLD } from "./logic/world"
import GameOverScene from "./scenes/GameOverScene"
import GameplayScene from "./scenes/GameplayScene"
import MenuScene from "./scenes/MenuScene"
import SlidesScene from "./scenes/SlidesScene"
import {
  Controls, EventBus, Keys, Loop, Renderer, SceneManager, Sounds, Sprite, Timers,
  type ActionHandlers, type ActionOf
} from "./logic/engine"

export type GameEvents = {
  say: { text:string, speaker:Speaker }
  toyReceived: { kind:ToyKind }
  /** The player stands on a toy they have no room for (sent every frame they stand there). */
  toyOutOfRoom: { kind:ToyKind }
  kidSpawned: { kid:Kid }
  kidHit: { kid:Kid }
  kidFled: { kid:Kid }
  kidGone: { kid:Kid }
  allKidsGone: void
  playerHit: void
  toyUsed: { kind:ItemKind }
  babyCried: void
}

/** The playground behind everything, as big as the world. */
const BACKGROUND = new Sprite({ playground:{ src:playgroundImage } }, `playground` )

/** Counted during a run, shown in the summary at its end. */
export type GameStats = {
  playSeconds: number
  kidsBeaten: number
  hitsTaken: number
  daysCompleted: number
}

/** Development only: `?level=2` in the URL starts new runs from that level, e.g. to test it. */
const FIRST_LEVEL_INDEX = import.meta.env.DEV ? Math.max( 0, (Number( new URLSearchParams( location.search ).get( `level` ) ) || 1) - 1 ) : 0

const NEW_RUN_STATS:GameStats = {
  playSeconds: 0,
  kidsBeaten: 0,
  hitsTaken: 0,
  daysCompleted: 0,
}

export default class Game {
  static controls = new Controls({
    moveUp: [ `KeyW`, `ArrowUp` ],
    moveDown: [ `KeyS`, `ArrowDown` ],
    moveLeft: [ `KeyA`, `ArrowLeft` ],
    moveRight: [ `KeyD`, `ArrowRight` ],
    switchPace: [ `ShiftLeft`, `ShiftRight` ],
    useToy: [ `Space`, `MouseLeft` ],
    nextToy: [ `KeyE`, `WheelDown` ],
    prevToy: [ `KeyQ`, `WheelUp` ],
    swapToy: [ `KeyF` ],
    pause: [ `Escape`, `KeyP` ],
    confirm: [ `Enter`, `Space` ],
    toggleDebug: [ `F3` ],
  })

  #actionHandlers: ActionHandlers<ActionOf<typeof Game.controls>> = {
    useToy: () => {
      // A click aims at the cursor (within a small angle in front), keys swing straight ahead.
      const pointer = Keys.pointer
      const isClick = pointer && Keys.isPressed([ `MouseLeft` ])

      this.player.useToy( isClick ? this.renderer.toWorld( pointer.clientX, pointer.clientY ) : undefined )
    },
    nextToy: () => this.player.inventory.select( 1 ),
    prevToy: () => this.player.inventory.select( -1 ),
    swapToy: () => this.player.swapToy(),
    toggleDebug: () => {
      this.isDebug = !this.isDebug
    },
  }

  /** The journal told how to swap toys in this run. */
  #hasExplainedSwap = false

  /** Debug mode: hurtbox outlines, and level scripts logging their steps. On by default during development. */
  isDebug = import.meta.env.DEV

  world = WORLD
  player = new Player( this )
  level: null | Level = null
  stats:GameStats = { ...NEW_RUN_STATS }
  /** Kept in the browser between runs. */
  achievements = new Achievements()

  root: HTMLElement
  events = new EventBus<GameEvents>()
  timers = new Timers()
  sounds = new Sounds()
  scenes = new SceneManager()
  loop = new Loop()
  view: ReturnType<Game[`mountView`]>
  renderer: Renderer

  constructor( root:HTMLElement ) {
    this.root = root
    this.view = this.mountView()
    this.renderer = new Renderer( this.view.getCanvas(), this.world )
    loadSavedBindings( this.controls )
    Keys.listenToPointer( this.view.getCanvas() )

    this.events.on( `kidFled`, ({ kid }) => {
      if (kid.health.isEmpty) this.stats.kidsBeaten++
    } )
    this.events.on( `playerHit`, () => this.stats.hitsTaken++ )

    // Full pockets for the first time in a run: how to swap.
    this.events.on( `toyOutOfRoom`, () => {
      if (this.#hasExplainedSwap) return

      this.#hasExplainedSwap = true
      this.view.addBriefEntry({
        variant: `note`,
        source: `note`,
        text: [ `Nie masz miejsca na tę zabawkę. `, { keys:this.controls.getKeyLabels( `swapToy` ) }, ` — zamień na nią tę w ręce.` ],
      })
    } )

    // Sounds of game actions
    this.events.on( `toyUsed`, ({ kind }) => {
      const { swing, throwing, watering } = ITEMS[ kind ]
      const sound = swing?.sound ?? throwing?.sound ?? watering?.sound
      if (sound) this.sounds.play( sound, { rateVariation:0.1 } )
    } )
    this.events.on( `kidHit`, () => this.sounds.play( SOUNDS.kidHit, { rateVariation:0.1 } ) )
    this.events.on( `kidFled`, () => this.sounds.play( SOUNDS.kidFled, { volume:0.6 } ) )
    this.events.on( `playerHit`, () => this.sounds.play( SOUNDS.playerHit ) )
    this.events.on( `toyReceived`, () => this.sounds.play( SOUNDS.pickup ) )

    this.start()
    this.scenes.switchTo( new MenuScene( this ) )
  }

  /** Shared controls, also reachable from code that only has the game instance (e.g. level scripts). */
  get controls() {
    return Game.controls
  }

  mountView() {
    const view = mount( GameView, { target:this.root, props:{ briefTitle:`Dziennik` } } )
    flushSync()

    return view
  }

  start() {
    this.loop.startLoop( (_timeMultiplier, { timeDelta }) => {
      Keys.update()

      this.scenes.update( timeDelta / 1000 )
      this.scenes.draw()

      // Only when something changed: a new, removed or selected item, or one recharging.
      const inventorySlots = this.player.inventory.getChangedSlots()
      if (inventorySlots) this.view.setInventory( inventorySlots )

      const playerHealth = this.player.health.getChangedData()
      if (playerHealth) this.view.setPlayerHealth({ ...playerHealth, icons:HEART_ICONS })
    } )
  }

  /** Starts a new run: a fresh player, journal and stats, then the first day. */
  startNewRun() {
    this.player = new Player( this )
    this.stats = { ...NEW_RUN_STATS }
    this.#hasExplainedSwap = false
    this.view.clearBrief()

    this.startDay( FIRST_LEVEL_INDEX )
  }

  /** Tells the day's story (if any), then plays the day. After the last day: the summary. */
  startDay( index:number, { withStory = true } = {} ) {
    const level = LEVELS[ index ]
    if (!level) return this.#endStory()

    const playDay = () => this.scenes.switchTo( new GameplayScene( this, index ) )

    if (withStory && level.story.length) this.scenes.switchTo( new SlidesScene( this, level.story, playDay ) )
    else playDay()
  }

  /**
   * Unlocks an achievement for good. Returns its name the first time (to announce it), `null` when it was unlocked before.
   */
  unlockAchievement( id:AchievementId ) {
    return this.achievements.unlock( id ) ? ACHIEVEMENTS[ id ].name : null
  }

  /** One frame of the playing world: level timers, player input and movement, kids and toys. */
  updateWorld( seconds:number ) {
    this.stats.playSeconds += seconds
    this.timers.update( seconds )

    // A lost day (e.g. a crying baby): the world stands still while mom has her say.
    if (this.level?.isFrozen) return this.level.update( seconds )

    this.player.moveInput = {
      x: Game.controls.getAxis( `moveLeft`, `moveRight` ),
      y: Game.controls.getAxis( `moveUp`, `moveDown` ),
    }
    this.player.isPaceSwitched = Game.controls.isHeld( `switchPace` )

    Game.controls.runPressedHandlers( this.#actionHandlers )
    this.player.update( seconds )
    this.level?.update( seconds )
  }

  drawWorld() {
    const { ctx } = this.renderer
    this.renderer.beginFrame( `#000` )

    // The playground picture covers the whole world, its top-left corner at the world's.
    BACKGROUND.draw( ctx, WORLD.x, WORLD.y, { anchor:{ x:0, y:0 } } )

    // Puddles lie on the ground, under everyone.
    for (const puddle of this.level?.puddles ?? []) puddle.draw( ctx )

    // Entities lower on screen are drawn on top.
    const level = this.level
    const entities = [ ...level?.toys ?? [], ...level?.babies ?? [], ...level?.kids ?? [], ...level?.projectiles ?? [], this.player ]

    entities.sort( (a, b) => a.y - b.y )
    for (const entity of entities) entity.draw( ctx )

    if (this.isDebug) for (const entity of entities) entity.drawDebug( ctx )
  }

  /** After the last day: the story's achievement (announced when new), and the summary of the run. */
  #endStory() {
    const newAchievement = this.unlockAchievement( `storyEnd` )
    const subtitle = newAchievement ? `Piaskownica jest twoja. Nowe osiągnięcie: ${newAchievement}!` : `Piaskownica jest twoja.`

    this.scenes.openOverlay( new GameOverScene( this, `Koniec!`, subtitle, { label:`Zagraj jeszcze raz`, action:() => this.startNewRun() } ) )
  }
}
