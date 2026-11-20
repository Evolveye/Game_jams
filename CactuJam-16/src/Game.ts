import { flushSync, mount } from "svelte"
import GameView from "./components/Game.svelte"
import Controls, { type ActionHandlers, type ActionOf } from "./logic/Controls"
import Keys from "./logic/Keys"
import Loop from "./logic/Loop"
import Renderer from "./logic/Renderer"

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
    moveUp: () => console.debug( `move up` ),
    moveDown: () => console.debug( `move down` ),
    moveLeft: () => console.debug( `move left` ),
    moveRight: () => console.debug( `move right` ),
    useToy: () => console.debug( `useToy` ),
    nextToy: () => console.debug( `nextToy` ),
    prevToy: () => console.debug( `prevToy` ),
  }

  world = { width:320, height:180 }
  player = { speed:2, x:this.world.width / 2, y:this.world.height / 2 }

  root: HTMLElement
  loop: Loop
  view: ReturnType<Game[`mountView`]>
  renderer: Renderer

  constructor( root:HTMLElement ) {
    this.root = root
    this.loop = new Loop()
    this.view = this.mountView()
    this.renderer = new Renderer( this.view.getCanvas(), this.world )

    this.start()
  }

  mountView() {
    const view = mount( GameView, { target:this.root } )
    flushSync()

    return view
  }

  start() {
    this.loop.startLoop( timeMultiplier => {
      this.update( timeMultiplier )
      this.draw()
    } )
  }

  update( timeMultiplier:number ) {
    Keys.update()

    if (Game.controls.isPressed( `pause` )) this.#isPaused = !this.#isPaused
    if (this.#isPaused) return

    Game.controls.runPressedHandlers( this.#actionHandlers )
    this.movePlayer( timeMultiplier )
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

    // Player
    ctx.fillStyle = `#3b82f6`
    ctx.fillRect( Math.round( this.player.x ) - 4, Math.round( this.player.y ) - 4, 8, 8 )
  }
}
