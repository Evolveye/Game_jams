import { flushSync, mount } from "svelte"
import GameView from "./components/Game.svelte"
import type { ToyKind } from "./entities/items/items"
import type Kid from "./entities/kids/Kid"
import Player from "./entities/Player"
import LEVELS from "./levels"
import type Level from "./logic/Level"
import type { Speaker } from "./logic/speakers"
import { SANDBOX, WORLD } from "./logic/world"
import {
  Controls, EventBus, Keys, Loop, Renderer, Timers,
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
  })

  #isPaused = false
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

  root: HTMLElement
  events = new EventBus<GameEvents>()
  timers = new Timers()
  loop = new Loop()
  view: ReturnType<Game[`mountView`]>
  renderer: Renderer

  constructor( root:HTMLElement ) {
    this.root = root
    this.view = this.mountView()
    this.renderer = new Renderer( this.view.getCanvas(), this.world )
    Keys.listenToPointer( this.view.getCanvas() )

    this.start()
    this.runLevel( 0 )
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
      this.update( timeDelta / 1000 )
      this.draw()

      // Only when something changed: a new, removed or selected item, or one recharging.
      const inventorySlots = this.player.inventory.getChangedSlots()
      if (inventorySlots) this.view.setInventory( inventorySlots )
    } )
  }

  runLevel( index:number ) {
    const level = LEVELS[ index ]
    if (!level) return console.info( `All days complete!` )

    this.level?.abort()
    this.level = level

    console.info( `Day ${index + 1}: ${level.name}` )

    level.run( this ).then( isCompleted => {
      if (isCompleted) this.runLevel( index + 1 )
    } )
  }

  update( seconds:number ) {
    Keys.update()

    if (Game.controls.isPressed( `pause` )) this.#isPaused = !this.#isPaused
    if (this.#isPaused) return

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

  draw() {
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
