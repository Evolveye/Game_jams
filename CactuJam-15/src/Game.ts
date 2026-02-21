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

class Entity {
  constructor(
    public boundary:Rect,
    public tagOn:undefined | string,
  ) {}
}

export default class Game {
  world: World
  camera: Camera
  player: Entity
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

    const playerX = this.world.width / 2 - playerWidth / 2
    const playerY = this.world.height / 2 - playerWidth / 2

    this.player = new Entity(
      new Rect( playerX, playerY, playerWidth, playerWidth ),
      this.world.getTileAt( playerX, playerY ),
    )

    this.camera.follow( this.player.boundary )

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

    const speed = 1
    const playerPos = this.player.boundary
    const playerCenter = Rect.getCenter( playerPos )

    if (Keys.isPressed( this.controls.up )) playerPos.y -= speed
    if (Keys.isPressed( this.controls.down )) playerPos.y += speed
    if (Keys.isPressed( this.controls.left )) playerPos.x -= speed
    if (Keys.isPressed( this.controls.right )) playerPos.x += speed

    this.player.tagOn = this.world.getTileAt( playerCenter.x, playerCenter.y )
    this.camera.followSlowly( playerPos )
    this.camera.apply( ctx )
    this.world.draw( ctx, this.camera )

    ctx.fillStyle = `white`
    ctx.fillRect( playerPos.x, playerPos.y, playerPos.width, playerPos.height )

    ctx.restore()
  }
}
