import { Rect } from "./logic/shapes"
import createTag from "./logic/createTag"
import World from "./logic/World"
import Quadtree from "./logic/Quadtree"
import Loop from "./logic/Loop"
import Camera from "./logic/Camera"
import { Men, Women } from "./entities/human"

type GameUi = {
  canvas: HTMLCanvasElement
}

export default class Game {
  world: World
  camera: Camera
  player: Women | Men
  loop = new Loop()

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
      maxTerrainDepth: 6,
    })

    this.camera = new Camera( ui.canvas.width, ui.canvas.height, this.world.width, this.world.height )
    const mapUnit = Quadtree.getNodeSize( this.world.chunkSize, this.world.maxTerrainDepth )

    const playerX = this.world.width / 2 - mapUnit / 2
    const playerY = this.world.height / 2 - mapUnit / 2
    const menMultiplier = 19
    const womenMultiplier = 18

    this.player = new Men(
      new Rect( playerX, playerY, mapUnit * menMultiplier, mapUnit * menMultiplier * 2 ),
      this.world.getTileAt( playerX, playerY ),
    )
    this.player = new Women(
      new Rect( playerX, playerY, mapUnit * womenMultiplier * 1, mapUnit * womenMultiplier * 2 ),
      this.world.getTileAt( playerX, playerY ),
    )

    this.camera.follow( Rect.getCenter( this.player.boundary ) )

    this.loop.startLoop( mul => this.draw( mul, ctx ) )
  }

  buildUi() {
    const canvas = createTag<HTMLCanvasElement>( `canvas`, { width:window.innerWidth, height:window.innerHeight } )
    const ctx = canvas.getContext( `2d` )
    if (!ctx) throw `guard`

    ctx.imageSmoothingEnabled = false

    document.body.innerHTML = ``
    document.body.appendChild( canvas )

    window.addEventListener( `wheel`, e => {
      e.preventDefault()

      const zoomSpeed = 0.1
      if (e.deltaY < 0) {
        this.camera.zoom = Math.min( this.camera.zoom + zoomSpeed, 3.0 ) // Max 300%
      } else {
        this.camera.zoom = Math.max( this.camera.zoom - zoomSpeed, 0.5 ) // Min 50%
      }

      this.camera.follow( Rect.getCenter( this.player.boundary ) )
    }, { passive:false } )

    return [ ctx, {
      canvas,
    } ] as const
  }

  draw( mul:number, ctx:CanvasRenderingContext2D ) {
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    ctx.save()
    this.camera.apply( ctx )

    const playerStepOnCenter = Rect.getCenter( this.player.collideBoundary )
    this.player.tagOn = this.world.getTileAt( playerStepOnCenter.x, playerStepOnCenter.y )

    this.camera.followSlowly( Rect.getCenter( this.player.boundary ) )

    this.world.draw( ctx, this.camera )
    this.player.draw( ctx, mul )

    ctx.restore()
  }
}
