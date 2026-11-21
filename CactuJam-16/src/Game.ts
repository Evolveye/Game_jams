import { flushSync, mount } from "svelte"
import GameView from "./components/Game.svelte"
import LEVELS from "./levels"
import type Level from "./logic/Level"
import type { Enemy, ToyKind } from "./logic/types"
import {
  Controls, EventBus, Keys, Loop, Renderer, Timers,
  type ActionHandlers, type ActionOf
} from "./logic/engine"

export type GameEvents = {
  say: { text:string }
  toyGiven: { kind:ToyKind }
  enemySpawned: { enemy:Enemy }
  enemyGone: { enemy:Enemy }
  allEnemiesGone: void
}

export default class Game {
  static controls = new Controls({
    moveUp: [ `KeyW`, `ArrowUp` ],
    moveDown: [ `KeyS`, `ArrowDown` ],
    moveLeft: [ `KeyA`, `ArrowLeft` ],
    moveRight: [ `KeyD`, `ArrowRight` ],
    useToy: [ `Space`, `KeyJ` ],
    nextToy: [ `KeyE` ],
    prevToy: [ `KeyQ` ],
    pause: [ `Escape`, `KeyP` ],
  })

  #isPaused = false
  #actionHandlers: ActionHandlers<ActionOf<typeof Game.controls>> = {
    moveUp: () => {},
    moveDown: () => {},
    moveLeft: () => {},
    moveRight: () => {},
    useToy: () => {},
    nextToy: () => {},
    prevToy: () => {},
  }

  world = { width:320, height:180 }
  player = { speed:2, x:this.world.width / 2, y:this.world.height / 2 }
  toys: ToyKind[] = []
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

    this.start()
    this.runLevel( 0 )
  }

  mountView() {
    const view = mount( GameView, { target:this.root } )
    flushSync()

    return view
  }

  start() {
    this.loop.startLoop( (timeMultiplier, { timeDelta }) => {
      this.update( timeMultiplier, timeDelta / 1000 )
      this.draw()
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

  update( timeMultiplier:number, seconds:number ) {
    Keys.update()

    if (Game.controls.isPressed( `pause` )) this.#isPaused = !this.#isPaused
    if (this.#isPaused) return

    this.timers.update( seconds )

    Game.controls.runPressedHandlers( this.#actionHandlers )
    this.movePlayer( timeMultiplier )
    this.chaseOffEnemies()
  }

  /** Placeholder: touching a kid chases it off. */
  chaseOffEnemies() {
    const level = this.level
    if (!level) return

    for (const enemy of [ ...level.enemies ]) {
      if (Math.hypot( enemy.x - this.player.x, enemy.y - this.player.y ) > 8) continue
      level.removeEnemy( enemy )
    }
  }

  movePlayer( timeMultiplier:number ) {
    const x = Game.controls.getAxis( `moveLeft`, `moveRight` )
    const y = Game.controls.getAxis( `moveUp`, `moveDown` )
    const length = Math.hypot( x, y )
    if (!length) return

    const step = this.player.speed * timeMultiplier / length

    this.player.x += x * step
    this.player.y += y * step
  }

  draw() {
    const { ctx } = this.renderer
    this.renderer.beginFrame( `#000` )

    // Sandbox
    ctx.fillStyle = `#e8c872`
    ctx.fillRect( 0, 0, this.world.width, this.world.height )

    // Enemies
    ctx.fillStyle = `#ef4444`
    for (const enemy of this.level?.enemies ?? []) ctx.fillRect( Math.round( enemy.x ) - 4, Math.round( enemy.y ) - 4, 8, 8 )

    // Player
    ctx.fillStyle = `#3b82f6`
    ctx.fillRect( Math.round( this.player.x ) - 4, Math.round( this.player.y ) - 4, 8, 8 )
  }
}
