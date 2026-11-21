import { flushSync, mount } from "svelte"
import GameView from "./components/Game.svelte"
import type { ToyKind } from "./entities/items/items"
import type Kid from "./entities/kids/Kid"
import Player from "./entities/Player"
import LEVELS from "./levels"
import type Level from "./logic/Level"
import type { Speaker } from "./logic/speakers"
import { SANDBOX, WORLD } from "./logic/world"
import GameOverScene from "./scenes/GameOverScene"
import GameplayScene from "./scenes/GameplayScene"
import MenuScene from "./scenes/MenuScene"
import SlidesScene from "./scenes/SlidesScene"
import {
  Controls, EventBus, Keys, Loop, Renderer, SceneManager, Timers,
  type ActionHandlers, type ActionOf
} from "./logic/engine"

export type GameEvents = {
  say: { text:string, speaker:Speaker }
  toyReceived: { kind:ToyKind }
  kidSpawned: { kid:Kid }
  kidHit: { kid:Kid }
  kidFled: { kid:Kid }
  kidGone: { kid:Kid }
  allKidsGone: void
  playerHit: void
}

/** Counted during a run, shown in the summary at its end. */
export type GameStats = {
  playSeconds: number
  kidsBeaten: number
  hitsTaken: number
  daysCompleted: number
}

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
    pause: [ `Escape`, `KeyP` ],
    confirm: [ `Enter`, `Space` ],
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
  }

  world = WORLD
  player = new Player( this )
  level: null | Level = null
  stats:GameStats = { ...NEW_RUN_STATS }

  root: HTMLElement
  events = new EventBus<GameEvents>()
  timers = new Timers()
  scenes = new SceneManager()
  loop = new Loop()
  view: ReturnType<Game[`mountView`]>
  renderer: Renderer

  constructor( root:HTMLElement ) {
    this.root = root
    this.view = this.mountView()
    this.renderer = new Renderer( this.view.getCanvas(), this.world )
    Keys.listenToPointer( this.view.getCanvas() )

    this.events.on( `kidFled`, ({ kid }) => {
      if (kid.health.isEmpty) this.stats.kidsBeaten++
    } )
    this.events.on( `playerHit`, () => this.stats.hitsTaken++ )

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
      if (playerHealth) this.view.setPlayerHealth( playerHealth )
    } )
  }

  /** Starts a new run: a fresh player, journal and stats, then the first day. */
  startNewRun() {
    this.player = new Player( this )
    this.stats = { ...NEW_RUN_STATS }
    this.view.clearBrief()

    this.startDay( 0 )
  }

  /** Tells the day's story (if any), then plays the day. After the last day: the summary. */
  startDay( index:number, { withStory = true } = {} ) {
    const level = LEVELS[ index ]
    if (!level) return this.scenes.openOverlay( new GameOverScene( this, `Koniec!`, `Piaskownica jest twoja.`, { label:`Zagraj jeszcze raz`, action:() => this.startNewRun() } ) )

    const playDay = () => this.scenes.switchTo( new GameplayScene( this, index ) )

    if (withStory && level.story.length) this.scenes.switchTo( new SlidesScene( this, level.story, playDay ) )
    else playDay()
  }

  /** One frame of the playing world: level timers, player input and movement, kids and toys. */
  updateWorld( seconds:number ) {
    this.stats.playSeconds += seconds
    this.timers.update( seconds )

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

    // Grass
    ctx.fillStyle = `#4d7c3a`
    ctx.fillRect( WORLD.x, WORLD.y, WORLD.width, WORLD.height )

    // Sandbox: wooden frame with sand inside
    ctx.fillStyle = `#8b5a2b`
    ctx.fillRect( SANDBOX.x - 3, SANDBOX.y - 3, SANDBOX.width + 6, SANDBOX.height + 6 )
    ctx.fillStyle = `#e8c872`
    ctx.fillRect( SANDBOX.x, SANDBOX.y, SANDBOX.width, SANDBOX.height )

    // Entities lower on screen are drawn on top.
    const entities = [ ...this.level?.toys ?? [], ...this.level?.kids ?? [], this.player ]

    entities.sort( (a, b) => a.y - b.y )
    for (const entity of entities) entity.draw( ctx )
  }
}
