import { Point } from "./world/shapes"
import Camera from "./world/Camera"
import World from "./world"
import createTag from "./createTag"
import Loop from "./Loop"
import Keys from "./Keys"

type GameUi = {
  canvas: HTMLCanvasElement
}

export default class Game {
  world = new World({
    seed: 1.2,
    chunkSize: 256,
    widthInChunks: 8,
    heightInChunks: 8,
    maxTerrainDepth: 4,
  })
  camera: Camera
  player: Point
  loop = new Loop()

  controls = {
    up: [ Keys.getKeyCode( `w` ), Keys.getKeyCode( `up` ) ],
    down: [ Keys.getKeyCode( `s` ), Keys.getKeyCode( `down` ) ],
    left: [ Keys.getKeyCode( `a` ), Keys.getKeyCode( `left` ) ],
    right: [ Keys.getKeyCode( `d` ), Keys.getKeyCode( `right` ) ],
  }

  ui: GameUi
  ctx: CanvasRenderingContext2D

  constructor() {
    const [ ctx, ui ] = this.buildUi()

    this.ui = ui
    this.ctx = ctx
    this.loop.startLoop( () => this.draw( ctx ) )
    this.camera = new Camera( ui.canvas.width, ui.canvas.height, this.world.width, this.world.height )
    this.player = new Point( this.world.width / 2, this.world.height / 2 )
  }

  buildUi() {
    const canvas = createTag<HTMLCanvasElement>( `canvas`, { width:1000, height:800 } )
    const ctx = canvas.getContext( `2d` )
    if (!ctx) throw `guard`

    document.body.innerHTML = ``
    document.body.appendChild( canvas )

    return [ ctx, {
      canvas,
    } ] as const
  }

  draw( ctx:CanvasRenderingContext2D ) {
    ctx.save()
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    const speed = 2

    if (Keys.isPressed( this.controls.up )) this.player.y -= speed
    if (Keys.isPressed( this.controls.down )) this.player.y += speed
    if (Keys.isPressed( this.controls.left )) this.player.x -= speed
    if (Keys.isPressed( this.controls.right )) this.player.x += speed

    this.camera.follow( this.player )
    this.camera.apply( ctx )
    this.world.draw( ctx, this.camera )

    ctx.fillStyle = `white`
    ctx.fillRect( this.player.x - 4, this.player.y - 4, 8, 8 )


    ctx.restore()
  }
}
