import makeEnum from "@/lib/core/functions/makeEnum"
import { UiData, UiManager, UiManagerHolder } from "@/lib/dynamicUi"
import { PlayerEntity } from "./entities/Player"
import Entity, { EntityDrawConfig } from "./entities/Entity"
import { PlatformEntity, TerminationPlatformEntity, WallEntity } from "./entities/Platform"
import Keys from "./Keys"
import Camera from "./Camera"
import { randomInt } from "@/lib/core/functions/numberUtils"
import { MayEntity } from "./entities/Enemy"
import { PowerupEntity, PowerupType } from "./entities/Powerups"
import sounds from "./sounds"

export const GameState = makeEnum( [ `SETUP`, `HOME`, `HOME->GAMEPLAY`, `GAMEPLAY`, `GAME-OVER` ] as const )
export type GameState = keyof typeof GameState

export default class CactuJam13Game implements UiManagerHolder {
  uiData: UiData = {}
  uiManager: UiManager<HTMLDivElement>
  ctx: CanvasRenderingContext2D

  sizes = {
    leftBorderWidth: 0,
    width: 0,
    fullWidth: 0,
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
    enemies: [] as (TerminationPlatformEntity | MayEntity)[],
    powerups: [] as PowerupEntity[],
  }

  camera = new Camera()
  state: GameState = `SETUP`
  higherScore = 0

  constructor( root:HTMLDivElement ) {
    this.uiManager = new UiManager( root )
    this.ctx = this.uiManager.registerCtx( `main`, `canvas` )
    this.setup().then( () => this.uiManager.startLoop( time => this.update( time ) ) )

    ;(window as any).game = this // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  async setup() {
    // console.clear()
    console.log( `Setup` )
    const { ctx, sizes } = this

    this.state = `HOME`

    const storedScore = window.localStorage.getItem( `higher-score-record` )
    this.higherScore = storedScore ? Number( storedScore ) : 0

    sizes.leftBorderWidth = 100
    sizes.fullWidth = ctx.canvas.width
    sizes.width = sizes.fullWidth - sizes.leftBorderWidth
    sizes.halfWidth = sizes.width / 2

    sizes.height = ctx.canvas.height
    sizes.halfHeight = sizes.height / 2

    Entity.sizeMultiplier = 3
    const w = sizes.width
    const h = sizes.height

    sizes.floorsGap = 200
    sizes.wallSize = 10
    sizes.wallHoleAfterPlatforms = 5
    sizes.floorsHole = 1
    sizes.wallHeight = sizes.floorsGap * sizes.wallHoleAfterPlatforms

    this.entities.powerups = []

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
        sizes.wallHeight / Entity.sizeMultiplier + sizes.floorsGap / 3,
      ),
      new WallEntity(
        sizes.wallSize,
        h - sizes.wallHeight / 2 - this.entities.platforms[ 0 ].halfHeight,
        sizes.wallSize * 2 / Entity.sizeMultiplier,
        sizes.wallHeight / Entity.sizeMultiplier,
      ),
    ]

    this.entities.enemies = [
      // new TerminationPlatformEntity( w / 2, h * 1.5, w / Entity.sizeMultiplier, sizes.height / Entity.sizeMultiplier ),
      new TerminationPlatformEntity( w / 2, h * 3, w / Entity.sizeMultiplier, sizes.height / Entity.sizeMultiplier ),
      //
    ]

    Array.from({ length:3 }).forEach( () => this.entities.enemies.push(
      new MayEntity(
        randomInt( 100, w - 100 ),
        this.entities.enemies[ 0 ].y - this.entities.enemies[ 0 ].halfHeight - 50,
      ),
    ) )


    this.camera = new Camera({ lookingAt:this.entities.characters[ 0 ] })

    const spritesLoading = Object.values( this.entities ).flatMap(
      collection => collection.map(
        e => new Promise( r => e.sprite ? e.sprite.onLoad( () => r( true ) ) : r( true ) ),
      ),
    )

    const soundsLoading = Object.values( sounds ).map( s => new Promise(
      r => s.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA ? r( s ) : s.addEventListener( `canplay`, () => r( s ) ),
    ) )

    this.uiManager.updateUi({})

    await Promise.all([ ...spritesLoading, ...soundsLoading ])
    console.log( `Setup done` )
  }

  setState( state:GameState ) {
    if (state === `GAME-OVER`) {
      const rand = Math.random()

      if (rand > 0.5) sounds.gameOver1.play()
      else sounds.gameOver2.play()
    }

    this.state = state
    this.uiManager.updateUi({})
  }

  update( gameSpeedMultiplier:number ) {
    if (this.state !== `GAMEPLAY`) return

    const { ctx, sizes, entities, camera } = this
    const player = camera.lookingAt as PlayerEntity

    if (!player) return
    if (Keys.isPressedOnce( `r` )) return this.setup()
    if (Keys.isPressedOnce( `g` ) && player instanceof PlayerEntity) player.toggleFlyMode()

    ctx.clearRect( 0, 0, sizes.fullWidth, sizes.height )

    const drawConfig:EntityDrawConfig = { ctx, camera, translate:{ x:sizes.leftBorderWidth } }
    const terminationPlatform = entities.enemies[ 0 ]
    const terminatorTop = terminationPlatform.y - terminationPlatform.halfHeight
    const isPressedWidePlatforms = Keys.isPressedOnce( `1` ) && player.getPowerup( `widePlatforms` )

    entities.walls = entities.walls.filter( wall => {
      if (wall.y > terminationPlatform.y + terminationPlatform.halfHeight * 2) return false

      wall.update( gameSpeedMultiplier )
      wall.draw( drawConfig )

      return true
    } )

    entities.platforms = entities.platforms.filter( platform => {
      if (platform.y > terminationPlatform.y + terminationPlatform.halfHeight) return false
      if (platform.y > terminatorTop) platform.x = 2000
      if (isPressedWidePlatforms) platform.w *= 2

      platform.update( gameSpeedMultiplier )
      platform.draw( drawConfig )

      return true
    } )

    entities.powerups = entities.powerups.filter( powerup => {
      powerup.update( gameSpeedMultiplier )

      if (powerup.owner) return false

      powerup.draw( drawConfig )

      return true
    } )

    for (const enemy of entities.enemies) {
      if (enemy instanceof MayEntity) {
        if (enemy.y > terminatorTop) {
          enemy.groundedOn = terminationPlatform
          enemy.y = terminatorTop - enemy.halfHeight
        }

        if (enemy.x < enemy.halfWidth * 2 || enemy.x > sizes.width - enemy.halfWidth * 2) {
          enemy.velocity.x *= -1
        }

        enemy.update( gameSpeedMultiplier, {
          surroundingSolids: [ terminationPlatform, ...entities.platforms ],
        } )
      } else if (enemy instanceof TerminationPlatformEntity) {
        if (player.y < sizes.height / 2) enemy.velocity.y = -1.5 - Math.floor( player.higherFloor / 50 ) * 0.5
        if (player.y - enemy.y < -sizes.height * 3) enemy.y = player.y + sizes.height * 3
        enemy.update( gameSpeedMultiplier )
      }

      enemy.draw( drawConfig )
    }

    for (const character of entities.characters) {
      const responses = character.update( gameSpeedMultiplier, {
        surroundingSolids: [ ...entities.platforms, ...entities.walls, ...entities.powerups, ...entities.enemies ],
      } ) ?? {}

      if (`powerup` in responses) this.uiManager.updateUi({})
      if (`terminator` in responses || player.y > terminatorTop) this.setState( `GAME-OVER` )
      if (`platform` in responses && player instanceof PlayerEntity && responses.platform) {
        if (player.setNewHigherFloor( Number( responses.platform ) ))
          this.uiManager.updateUi({})
      }

      if (player.points > this.higherScore) {
        this.higherScore = player.points
        window.localStorage.setItem( `higher-score-record`, `${this.higherScore}` )
      }

      character.draw( drawConfig )
    }

    const platform = entities.platforms.at( -5 ) ?? entities.platforms[ 0 ]
    if (player.y < platform.y + sizes.halfHeight) {
      const newFloorIndex = entities.platforms.at( -1 )!.floorIndex + 1
      const fullFloor = newFloorIndex % sizes.wallHoleAfterPlatforms === 0
      const y = entities.platforms.at( -1 )!.y - sizes.floorsGap
      const rand = Math.random()

      if (!fullFloor && rand < 1 / 20) {
        console.log( `POWERUP SPAWN` )
        entities.powerups.push(
          new PowerupEntity(
            randomInt( 50, sizes.width - 50 ),
            y,
            rand < 1 / 33 ? PowerupType.widePlatforms : PowerupType.doubleJump,
          ),
        )
      }

      console.log( `PLATFORM SPAWN ${newFloorIndex}` )

      entities.platforms.push( new PlatformEntity(
        fullFloor ? sizes.width / 2 : randomInt( 170, sizes.width - 170 ),
        y,
        fullFloor ? sizes.halfWidth / Entity.sizeMultiplier * 2 - 20 : randomInt( 90, 150 ),
        // sizes.width,
        sizes.wallSize * 2 / Entity.sizeMultiplier,
        newFloorIndex,
      ) )
    }

    const wall = entities.walls.at( -1 ) ?? entities.walls[ 0 ]
    if (player.y < wall.y) {
      console.log( `WALL SPAWN` )

      // const y = wall.y - wall.halfHeight - sizes.floorsGap * sizes.floorsHole - (sizes.floorsGap * (sizes.wallHoleAfterPlatforms - sizes.floorsHole)) / 2
      const y = wall.y - wall.halfHeight

      entities.walls.push(
        new WallEntity(
          sizes.width - sizes.wallSize,
          y,
          sizes.wallSize * 2 / Entity.sizeMultiplier,
          sizes.floorsGap / Entity.sizeMultiplier * (sizes.wallHoleAfterPlatforms),
        ),
        new WallEntity(
          sizes.wallSize,
          y,
          sizes.wallSize * 2 / Entity.sizeMultiplier,
          // sizes.floorsGap / Entity.sizeMultiplier * (sizes.wallHoleAfterPlatforms - sizes.floorsHole),
          sizes.floorsGap / Entity.sizeMultiplier * (sizes.wallHoleAfterPlatforms),
        ),
      )
    }
  }
}
