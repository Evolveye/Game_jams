import { UiManager, UiManagerHolder } from "@/lib/dynamicUi"
import { PlayerEntity } from "./entities/Player"
import Entity from "./entities/Entity"
import { PlatformEntity, WallEntity } from "./entities/Platform"
import Keys from "./Keys"
import Camera from "./Camera"
import { randomInt } from "@/lib/core/functions/numberUtils"

export default class CactuJam13Game implements UiManagerHolder {
  uiManager: UiManager<HTMLDivElement>
  ctx: CanvasRenderingContext2D

  sizes = {
    width: 0,
    halfWidth: 0,
    height: 0,
    halfHeight: 0,
    wallSize: 0,
    wallHeight: 0,
    floorsGap: 0,
    floorsHole: 0,
    wallHoleAfterPlatforms: 0,
  }

  entities = {
    walls: [] as WallEntity[],
    platforms: [] as PlatformEntity[],
    characters: [] as PlayerEntity[],
  }
  camera = new Camera()

  constructor( root:HTMLDivElement ) {
    this.uiManager = new UiManager( root )
    this.ctx = this.uiManager.registerCtx( `main`, `canvas` )
    this.setup().then( () => this.uiManager.startLoop( time => this.update( time ) ) )

    ;(window as any).game = this // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  setup() {
    console.clear()
    console.log( `Setup` )
    const { ctx, sizes } = this

    sizes.width = ctx.canvas.width
    sizes.halfWidth = sizes.width / 2

    sizes.height = ctx.canvas.height
    sizes.halfHeight = sizes.height / 2

    Entity.sizeMultiplier = 3
    const w = sizes.width
    const h = sizes.height

    sizes.floorsGap = 200
    sizes.wallSize = 10
    sizes.wallHoleAfterPlatforms = 4
    sizes.floorsHole = 1
    sizes.wallHeight = sizes.floorsGap * sizes.wallHoleAfterPlatforms

    this.entities.platforms = [
      new PlatformEntity( w / 2, h - sizes.wallSize, w / Entity.sizeMultiplier, sizes.wallSize * 2 / Entity.sizeMultiplier, 0 ),
      //
    ]

    this.entities.characters = [
      new PlayerEntity( 120, sizes.height - 150 ),
      //
    ]

    this.entities.walls = [
      new WallEntity(
        w - sizes.wallSize,
        h - sizes.wallHeight / 2 - this.entities.platforms[ 0 ].halfHeight - sizes.floorsGap / 2,
        sizes.wallSize * 2 / Entity.sizeMultiplier,
        sizes.wallHeight / (Entity.sizeMultiplier) + sizes.floorsGap / 3,
      ),
      new WallEntity(
        sizes.wallSize,
        h - sizes.wallHeight / 2 - this.entities.platforms[ 0 ].halfHeight,
        sizes.wallSize * 2 / Entity.sizeMultiplier,
        sizes.wallHeight / (Entity.sizeMultiplier),
      ),
    ]

    this.camera = new Camera({ lookingAt:this.entities.characters[ 0 ] })

    const spritesLoading = Object.values( this.entities ).flatMap(
      collection => collection.map(
        e => new Promise( r => e.sprite ? e.sprite.onLoad( () => r( true ) ) : r( true ) ),
      ),
    )

    return Promise.all( spritesLoading )
  }

  update( gameSpeedMultiplier:number ) {

    const { ctx, sizes, entities, camera } = this
    const player = camera.lookingAt
    if (!player) return
    if (Keys.isPressedOnce( `r` )) return this.setup()
    if (Keys.isPressedOnce( `g` ) && player instanceof PlayerEntity) player.toggleFlyMode()

    ctx.clearRect( 0, 0, sizes.width, sizes.height )

    for (const platform of entities.platforms) {
      platform.update( gameSpeedMultiplier )
      platform.draw({ ctx, camera, drawCenter:true })
    }

    for (const wall of entities.walls) {
      wall.update( gameSpeedMultiplier )
      wall.draw({ ctx, camera, drawCenter:true })
    }

    for (const character of entities.characters) {
      character.update( gameSpeedMultiplier, { surroundingSolids:[ ...entities.platforms, ...entities.walls ] } )
      character.draw({ ctx, camera })
    }

    const platform = entities.platforms.at( -5 ) ?? entities.platforms[ 0 ]
    if (player.y < platform.y + sizes.halfHeight) {
      const newFloorIndex = entities.platforms.at( -1 )!.floorIndex + 1

      console.log( `PLATFORM SPAWN ${newFloorIndex}` )

      entities.platforms.push( new PlatformEntity(
        randomInt( 170, sizes.width - 170 ),
        entities.platforms.at( -1 )!.y - sizes.floorsGap,
        newFloorIndex % sizes.wallHoleAfterPlatforms === 0 ? sizes.width : 100,
        // sizes.width,
        sizes.wallSize * 2 / Entity.sizeMultiplier,
        newFloorIndex,
      ) )
    }

    const wall = entities.walls.at( -1 ) ?? entities.walls[ 0 ]
    if (player.y < wall.y) {
      console.log( `WALL SPAWN`, sizes.wallHeight, sizes.floorsGap )

      entities.walls.push(
        new WallEntity(
          sizes.width - sizes.wallSize,
          wall.y - wall.halfHeight - sizes.floorsGap * sizes.floorsHole - (sizes.floorsGap * (sizes.wallHoleAfterPlatforms - sizes.floorsHole)) / 2,
          sizes.wallSize * 2 / Entity.sizeMultiplier,
          sizes.floorsGap / Entity.sizeMultiplier * (sizes.wallHoleAfterPlatforms),
        ),
        new WallEntity(
          sizes.wallSize,
          wall.y - wall.halfHeight - sizes.floorsGap * sizes.floorsHole - (sizes.floorsGap * (sizes.wallHoleAfterPlatforms - sizes.floorsHole)) / 2,
          sizes.wallSize * 2 / Entity.sizeMultiplier,
          sizes.floorsGap / Entity.sizeMultiplier * (sizes.wallHoleAfterPlatforms - sizes.floorsHole),
        ),
      )
    }
  }
}
