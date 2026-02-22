import { Rect } from "./logic/shapes"
import createTag from "./logic/createTag"
import controls from "./logic/controls"
import World, { type Drawable } from "./logic/World"
import Sprite from "./logic/Sprite"
import Loop from "./logic/Loop"
import Keys from "./logic/Keys"
import Camera from "./logic/Camera"
import { HumanEntity } from "./entities/human"
import arrowHeadImgSrc from "./entities/arrowHead.png"

type GameUi = {
  canvas: HTMLCanvasElement
}

export default class Game {
  utilitiesSprites = {
    arrowHead: new Sprite( arrowHeadImgSrc, {
      framesPerRow: 2,
      framesPerColumn: 2,
      framePixelsPadding: 1,
    } ),
  }
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

    this.loop.startLoop( (mul, { iterationsCount }) => this.draw( ctx, mul, iterationsCount ) )
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

    window.addEventListener( `click`, ({ clientX, clientY }) => {
      const chunksInRadius = new Set<string>()
      const entities:Drawable[] = []
      const clickPos = {
        x: this.camera.x + clientX,
        y: this.camera.y + clientY,
      }
      const distance = this.world.sizeUnit * 20

      const checks = [
        { x:this.camera.x + clientX - distance, y:this.camera.y + clientY - distance },
        { x:this.camera.x + clientX + distance, y:this.camera.y + clientY - distance },
        { x:this.camera.x + clientX - distance, y:this.camera.y + clientY + distance },
        { x:this.camera.x + clientX + distance, y:this.camera.y + clientY + distance },
      ]

      for (const checkPos of checks) {
        const { x, y } = this.world.roundPosToChunk( checkPos.x, checkPos.y )
        const key = `${x},${y}`

        if (chunksInRadius.has( key )) continue
        chunksInRadius.add( key )

        const chunk = this.world.getChunk( x, y )
        if (!chunk) continue

        entities.push( ...chunk.entities )
      }

      const sortedEntities = entities.map( entity => {
        const center = Rect.getCenter( entity.boundary )
        const distance = Math.hypot( clickPos.x - center.x, clickPos.y - center.y )

        return { entity, center, distance }
      } ).toSorted( (a, b) => a.distance - b.distance )

      console.log( `%cAt (${clientX}, ${clientY}) is %c${this.world.getTileAt( this.camera.x + clientX, this.camera.y + clientY )}`, `color:gray`, `font-weight:bold` )
      if (sortedEntities[ 0 ]?.entity) {
        console.log( `   %c and found entity is`, `color:gray`, { entity:sortedEntities[ 0 ].entity } )

        const firstHuman = sortedEntities.find( e => e.entity instanceof HumanEntity )?.entity as HumanEntity
        if (firstHuman) this.changePlayer( firstHuman )
      }
    }, { passive:false } )

    return [ ctx, {
      canvas,
    } ] as const
  }

  changePlayer( entity:HumanEntity ) {
    if (this.player === entity) return

    this.player.sprites.changeSprite( `idle` )
    this.player = entity
  }

  draw( ctx:CanvasRenderingContext2D, timeMultiplier:number, iterationsCount:number ) {
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
    ctx.globalAlpha = 0.25
    this.utilitiesSprites.arrowHead.draw(
      ctx,
      player.boundary.x + player.boundary.width / 2 - this.world.sizeUnit * 4,
      player.boundary.y - 50,
      this.world.sizeUnit * 8,
      this.world.sizeUnit * 11,
    )

    if (iterationsCount % 30 === 0) this.utilitiesSprites.arrowHead.nextFrame()
    ctx.globalAlpha = 1


    ctx.restore()
  }
}
