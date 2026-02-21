import { Rect } from "./logic/shapes"
import createTag from "./logic/createTag"
import World from "./logic/World"
import Quadtree from "./logic/Quadtree"
import Loop from "./logic/Loop"
import Keys from "./logic/Keys"
import Camera from "./logic/Camera"

type GameUi = {
  canvas: HTMLCanvasElement
}

export default class Game {
  world: World
  camera: Camera
  player: Rect
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

    this.world = new World({
      seed: 1.2,
      chunkSize: 256,
      widthInChunks: 16,
      heightInChunks: 16,
      maxTerrainDepth: 5,
    })

    this.camera = new Camera( ui.canvas.width, ui.canvas.height, this.world.width, this.world.height )
    const playerWidth = Quadtree.getNodeSize( this.world.chunkSize, this.world.maxTerrainDepth )
    this.player = new Rect( this.world.width / 2 - playerWidth / 2, this.world.height / 2 - playerWidth / 2, playerWidth, playerWidth )

    this.camera.follow( this.player )

    this.loop.startLoop( () => this.draw( ctx ) )
  }

  buildUi() {
    const canvas = createTag<HTMLCanvasElement>( `canvas`, { width:window.innerWidth, height:window.innerHeight } )
    const ctx = canvas.getContext( `2d` )
    if (!ctx) throw `guard`

    ctx.imageSmoothingEnabled = false

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

    this.camera.followSlowly( this.player )
    this.camera.apply( ctx )
    this.world.draw( ctx, this.camera )

    ctx.fillStyle = `white`
    ctx.fillRect( this.player.x, this.player.y, this.player.width, this.player.height )

    ctx.restore()
  }
}
