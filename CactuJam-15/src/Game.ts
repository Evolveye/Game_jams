import { Rect } from "./logic/shapes"
import createTag from "./logic/createTag"
import controls from "./logic/controls"
import World from "./logic/World"
import Loop from "./logic/Loop"
import Keys from "./logic/Keys"
import Camera from "./logic/Camera"
import { HumanEntity } from "./entities/human"

type GameUi = {
  canvas: HTMLCanvasElement
}

export default class Game {
  world: World
  camera: Camera
  player: HumanEntity
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

    const player = this.world.findEntityNear<HumanEntity>( this.world.width / 2, this.world.height / 2, e => e instanceof HumanEntity )
    if (!player) throw new Error( `Missing player` )
    this.player = player

    this.camera.follow( Rect.getCenter( this.player.boundary ) )

    this.loop.startLoop( mul => this.draw( ctx, mul ) )
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

  draw( ctx:CanvasRenderingContext2D, timeMultiplier:number ) {
    const { camera, player } = this
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.save()

    camera.apply( ctx )
    camera.followSlowly( Rect.getCenter( this.player.boundary ) )

    const speed = 5 * timeMultiplier
    const playerPos = player.boundary
    const playerVelocity = player.velocity
    const playerFlip = player.sprites.current!.flip

    if (Keys.isPressed( controls.up )) playerVelocity.y -= speed
    if (Keys.isPressed( controls.down )) playerVelocity.y += speed
    if (Keys.isPressed( controls.left )) playerVelocity.x -= speed
    if (Keys.isPressed( controls.right )) playerVelocity.x += speed

    playerFlip.x = false
    if (player.velocity.x > 0) player.sprites.changeSprite( `walking` )
    else if (playerVelocity.x < 0) {
      player.sprites.changeSprite( `walking` )
      playerFlip.x = true
    } else {
      if (playerVelocity.y < 0) player.sprites.changeSprite( `walking` )
      else if (playerVelocity.y > 0) {
        player.sprites.changeSprite( `walking` )
        playerFlip.x = true
      } else player.sprites.changeSprite( `idle` )
    }

    const posBefore = Rect.getCenter( player.collideBoundary )

    playerPos.x += playerVelocity.x
    playerPos.y += playerVelocity.y
    player.updateBoundaries()

    this.world.moveEntity( posBefore, player )

    playerVelocity.x = 0
    playerVelocity.y = 0

    this.world.draw({ ctx, timeMultiplier, camera, updatePosition:this.world.moveEntity })

    ctx.restore()
  }
}
