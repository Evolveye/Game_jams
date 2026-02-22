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
  cursor: HTMLElement
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

    this.camera = new Camera( ui.canvas.width, ui.canvas.height, this.world.width, this.world.height, ui.cursor )

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

    const cursor = createTag<HTMLElement>( `i`, { id:`cursor` } )
    document.body.appendChild( cursor )

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
      console.log( `%cAt (${clientX}, ${clientY}) is %c${this.world.getTileAt( this.camera.pointerPos.x, this.camera.pointerPos.y )}`, `color:gray`, `font-weight:bold` )
    }, { passive:false } )

    return [ ctx, {
      canvas,
      cursor,
    } ] as const
  }

  changePlayer( entity?:HumanEntity ) {
    if (!entity || this.player === entity) return

    this.player.sprites.changeSprite( `idle` )
    this.player = entity
  }

  draw( ctx:CanvasRenderingContext2D, timeMultiplier:number, iterationsCount:number ) {
    // Dead player processing
    if (this.player.stage === `dead`) {
      const newPlayer = this.world.findEntityNear<HumanEntity>( this.world.width / 2, this.world.height / 2, Infinity, e => e instanceof HumanEntity && e.stage !== `dead` )
      if (newPlayer) this.player = newPlayer
      else alert( `Game over` )
    }


    // Setup
    const { camera, player } = this
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.save()

    camera.apply( ctx )
    camera.followSlowly( Rect.getCenter( this.player.boundary ) )

    const posBefore = Rect.getCenter( player.collideBoundary )
    const speed = player.getSpeed() * timeMultiplier
    const playerPos = player.boundary
    const playerVelocity = player.velocity
    const playerFlip = player.sprites.current!.flip
    let cursorChanged = false


    // Player logic
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


    playerPos.x += playerVelocity.x
    playerPos.y += playerVelocity.y
    player.updateBoundaries()

    this.world.moveEntity( posBefore, player )

    playerVelocity.x = 0
    playerVelocity.y = 0


    // World draw
    const visibleChunks = this.world.drawTerrain({ ctx, timeMultiplier, camera, updatePosition:this.world.moveEntity })

    const nearEntitiesGen = this.world.getNearEntitiesGenerator<Drawable>(
      posBefore.x, posBefore.y, 1,
      e => e !== player && Rect.getDistance( player.collideBoundary, e.collideBoundary ?? e.boundary ) < 25,
    )

    ctx.fillStyle = `#aaa`
    for (const entity of nearEntitiesGen) {
      if (Rect.containsPoint( entity.boundary, camera.pointerPos )) {
        camera.updateCursor( `action` )
        cursorChanged = true
        ctx.fillStyle = `#fff`
        ctx.fillRect( entity.boundary.x, entity.boundary.y + entity.boundary.height - 2, entity.boundary.width, 2 )
        ctx.fillStyle = `#aaa`
      } else {
        ctx.fillRect( entity.boundary.x, entity.boundary.y + entity.boundary.height - 2, entity.boundary.width, 2 )
      }
    }

    const cursorEntity = this.world.findEntityNear<Drawable>(
      camera.pointerPos.x, camera.pointerPos.y, 1,
      e => e !== player && Rect.containsPoint( e.boundary, camera.pointerPos ),
    )

    if (cursorEntity instanceof HumanEntity) {
      if (camera.pointerDown) this.changePlayer( cursorEntity )
      if (!cursorChanged) {
        cursorChanged = true
        camera.updateCursor( `action` )
      }
    }

    this.world.drawEntities( visibleChunks, { ctx, timeMultiplier, camera, updatePosition:this.world.moveEntity } )


    // Utilities
    ctx.globalAlpha = 0.25
    this.utilitiesSprites.arrowHead.draw(
      ctx,
      player.boundary.x + player.boundary.width / 2 - this.world.sizeUnit * 4,
      player.boundary.y - 50,
      this.world.sizeUnit * 8,
      this.world.sizeUnit * 11,
    )
    ctx.globalAlpha = 1
    if (iterationsCount % 30 === 0) this.utilitiesSprites.arrowHead.nextFrame()


    ctx.restore()

    if (!cursorChanged) camera.updateCursor( `default` )
  }
}
