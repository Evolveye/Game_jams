import { Point, Rect } from "./logic/shapes"
import createTag from "./logic/createTag"
import World from "./logic/World"
import Sprite, { SpritesStorage, type SpriteConfig } from "./logic/Sprite"
import Quadtree from "./logic/Quadtree"
import Loop from "./logic/Loop"
import Keys from "./logic/Keys"
import Camera from "./logic/Camera"
import humanImgSrc from "./entities/human.png"
import humanWalkImgSrc from "./entities/human-walk.png"

type GameUi = {
  canvas: HTMLCanvasElement
}

class Player {
  sprites = new SpritesStorage({
    idle: {
      src: humanImgSrc,
      framesPerRow: 3,
      framesPerColumn: 2,
      framesCount: 4,
      framePixelsPadding: 1,
    },
    walking: {
      src: humanWalkImgSrc,
      framesPerRow: 3,
      framesPerColumn: 2,
      framesCount: 4,
      framePixelsPadding: 1,
    },
  })

  velocity: Point = new Point( 0, 0 )

  constructor(
    public boundary:Rect,
    public tagOn:undefined | string,
  ) {}
}

export default class Game {
  world: World
  camera: Camera
  player: Player
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
      maxTerrainDepth: 6,
    })

    this.camera = new Camera( ui.canvas.width, ui.canvas.height, this.world.width, this.world.height )
    const mapUnit = Quadtree.getNodeSize( this.world.chunkSize, this.world.maxTerrainDepth )

    const playerX = this.world.width / 2 - mapUnit / 2
    const playerY = this.world.height / 2 - mapUnit / 2
    const playerMultiplier = 19

    this.player = new Player(
      new Rect( playerX, playerY, mapUnit * playerMultiplier, mapUnit * playerMultiplier * 2 ),
      this.world.getTileAt( playerX, playerY ),
    )

    this.camera.follow( this.player.boundary )

    this.loop.startLoop( (mul, { iterationsCount }) => this.draw( mul, iterationsCount, ctx ) )
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

  draw( mul:number, iterationsCount:number, ctx:CanvasRenderingContext2D ) {
    ctx.save()
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )

    const speed = 5 * mul
    const playerPos = this.player.boundary
    const playerVelocity = this.player.velocity
    const playerCenter = Rect.getCenter( playerPos )

    if (Keys.isPressed( this.controls.up )) playerVelocity.y -= speed
    if (Keys.isPressed( this.controls.down )) playerVelocity.y += speed
    if (Keys.isPressed( this.controls.left )) playerVelocity.x -= speed
    if (Keys.isPressed( this.controls.right )) playerVelocity.x += speed

    let xFlip = false
    if (playerVelocity.x > 0) this.player.sprites.changeSprite( `walking` )
    else if (playerVelocity.x < 0) {
      this.player.sprites.changeSprite( `walking` )
      xFlip = true
    } else {
      if (playerVelocity.y < 0) this.player.sprites.changeSprite( `walking` )
      else if (playerVelocity.y > 0) {
        this.player.sprites.changeSprite( `walking` )
        xFlip = true
      } else this.player.sprites.changeSprite( `idle` )
    }

    this.player.boundary.x += playerVelocity.x
    this.player.boundary.y += playerVelocity.y

    playerVelocity.x = 0
    playerVelocity.y = 0

    this.player.tagOn = this.world.getTileAt( playerCenter.x, playerCenter.y )
    this.camera.followSlowly( playerPos )
    this.camera.apply( ctx )
    this.world.draw( ctx, this.camera )

    // ctx.strokeStyle = `red`
    // ctx.rect( playerPos.x, playerPos.y, playerPos.width, playerPos.height )
    // ctx.stroke()

    if (iterationsCount % 30 === 0) this.player.sprites.current?.nextFrame()
    this.player.sprites.current?.draw( ctx, playerPos.x, playerPos.y, playerPos.width, playerPos.height, { x:xFlip ? -1 : 1 } )

    ctx.restore()
  }
}
