import { Primitive } from "@lib/theming/types"
import { GameColors } from "./types"
import Level, { PlayerMoverReturnType } from "./level"
import Game from "./controller"
import KeysController from "./KeysController"

export type GameConfig = {
  colors: GameColors
}

type PickBools<T extends Record<string, Primitive>> = {
  [K in keyof T]:T[K] extends boolean ? K : never;
}[keyof T]

export default class CactuJam12Game extends Game {
  debug = false

  keys = new KeysController()
  ticks = 0

  level: null | Level = null
  ctx: CanvasRenderingContext2D
  colors: GameColors

  uiData = {
    experience: 0,
    speed: this.debug ? 9 : 1,
    knownAreas: 0,
    knownTiles: 0,
    closedAreas: 0,
    stage: 0,
    destroyedAreas: 0,
    score: 0,
    visibleScore: false,
    gameOver: false,
    expincomeGood: false,
    tooBigAreaInfo: false,
    borderReached: false,
    usedW: false,
    usedS: false,
    usedA: false,
    usedD: false,
  }

  enemyTimerId: null | number = null

  constructor( div:HTMLDivElement, { colors }:GameConfig ) {
    super( div )

    this.colors = colors

    this.ctx = this.registerCtx( `main`, `canvas` )

    this.runLevel( 1 )
    this.startLoop()
  }

  runLevel( id:number ) {
    if (id === 1) {
      this.level = new Level( this.colors )
    }
  }

  draw() {
    this.level?.draw( this.ctx )
  }

  logic() {
    const { level, ticks, uiData } = this
    this.ticks++

    const initialSpeedTick = 9
    const speedTick = initialSpeedTick - uiData.speed < 0 ? 0 : initialSpeedTick - uiData.speed

    const initialEnemiesSpeedTick = 9
    const enemySpeedTick = uiData.stage < initialEnemiesSpeedTick ? initialEnemiesSpeedTick - uiData.stage : 1

    if (!speedTick || ticks % speedTick === 0) this.logicBySpeed()
    if (!level) return

    level.logic( this.ctx )

    if (ticks % enemySpeedTick === 0) {
      level.entities.filter( e => e.tags.includes( `danger` ) ).forEach( e => {
        const newEnemyPos = level.moveEnemyBy( e.x, e.y, 0, -1 )

        if (newEnemyPos && `collidingCell` in newEnemyPos) {
          const topTags = newEnemyPos.collidingCell?.getTop()?.tags

          if (topTags?.has( `deep land` )) {
            const result = level.destroyFilledLand( e.x, e.y - 1 )

            if (result) {
              level.removeEntity( e.x, e.y )
              uiData.knownTiles -= result
              uiData.destroyedAreas++

              if (uiData.knownTiles < 0) uiData.knownTiles = 0

              this.updateUi()
            }
          } else if (topTags?.has( `city` )) {
            uiData.gameOver = true
            this.calcScore()
            this.updateUi()
            this.stopLoop()
          }
        }
      } )
    }

    if (uiData.stage === 2) {
      if (!this.enemyTimerId) {
        const spawnEnemy = () => {
          const randInt = (min:number, max:number) => Math.floor( Math.random() * (max - min) ) + min

          const x = randInt( 3, level.levelDimensions.x - 3 )
          const y = randInt( 100, 400 )
          const currentCell = level.getCell( x, y )
          const topTags = currentCell?.getTop()?.tags

          if (!topTags?.has( `deep land` )) {
            level.createTile( x, y, `danger` )
          }
        }

        this.enemyTimerId = window.setTimeout( () => {
          spawnEnemy()
          this.enemyTimerId = null
        }, 7500 )
      }
    } else if (uiData.stage === 3) {
      if (!this.enemyTimerId && !level.entities.length) {
        const spawnEnemy = () => {
          const randInt = (min:number, max:number) => Math.floor( Math.random() * (max - min) ) + min

          const x = randInt( 3, level.levelDimensions.x - 3 )
          const y = randInt( 150, 600 )
          const currentCell = level.getCell( x, y )
          const topTags = currentCell?.getTop()?.tags

          if (topTags?.has( `deep land` )) {
            const result = level.destroyFilledLand( x, y )

            if (result) {
              uiData.knownTiles -= result
              uiData.destroyedAreas++

              if (uiData.knownTiles < 0) uiData.knownTiles = 0

              this.updateUi()
            }
          } else {
            level.createTile( x, y, `danger` )
          }
        }

        this.enemyTimerId = window.setTimeout( () => {
          spawnEnemy()
          this.enemyTimerId = null
        }, 3000 )
      }
    }

    // if (keys.isPressedOnce( `w` )) newPlayerPos = level.movePlayerBy( 0, 1 )
    // if (!newPlayerPos && keys.isPressedOnce( `s` )) newPlayerPos = level.movePlayerBy( 0, -1 )
    // if (!newPlayerPos && keys.isPressedOnce( `a` )) newPlayerPos = level.movePlayerBy( -1, 0 )
    // if (!newPlayerPos && keys.isPressedOnce( `d` )) newPlayerPos = level.movePlayerBy( 1, 0 )

    // if (!(ticks % 60)) console.log( newPlayerPos ?? playerTileInfo )
  }

  logicBySpeed() {
    const { keys, level, uiData } = this

    if (!level) return

    const playerTileInfo = level.getPlayerTileInfo()
    let newPlayerPos:PlayerMoverReturnType = undefined

    if (keys.isPressed( `w`, `up` )) {
      this.updateUiFlag( `usedW` )
      newPlayerPos = level.movePlayerBy( 0, 1 )
    }

    if (!newPlayerPos && keys.isPressed( `s`, `down` )) {
      this.updateUiFlag( `usedS` )
      newPlayerPos = level.movePlayerBy( 0, -1 )
    }

    if (!newPlayerPos && keys.isPressed( `a`, `left` )) {
      this.updateUiFlag( `usedA` )
      newPlayerPos = level.movePlayerBy( -1, 0 )
    }

    if (!newPlayerPos && keys.isPressed( `d`, `right` )) {
      this.updateUiFlag( `usedD` )
      newPlayerPos = level.movePlayerBy( 1, 0 )
    }

    if (newPlayerPos && `collidingCell` in newPlayerPos) {
      const topTags = newPlayerPos.collidingCell?.getTop()?.tags

      if (topTags?.has( `border` )) uiData.borderReached = true

      this.updateUi()
    } else if (newPlayerPos && `swapedCell` in newPlayerPos) {
      const swapedCellTop = newPlayerPos.swapedCell?.getTop()
      const isNewPosKnown = swapedCellTop && swapedCellTop.tags.has( `trail` )
        || swapedCellTop?.tags.has( `land` )
        || swapedCellTop?.tags.has( `deep land` )

      if (!isNewPosKnown) {
        uiData.knownTiles++
        this.updateUi()
      }

      level.createTile( playerTileInfo.x, playerTileInfo.y, `trail` )
      const ngbrs = level.getCellNeighbours( newPlayerPos.x, newPlayerPos.y )

      if (!isNewPosKnown && Object.values( ngbrs ).filter( Boolean ).length > 1) {
        const checkData = [
          { x:-1, y:1 },
          { x:0, y:1 },
          { x:1, y:1 },
          { x:-1, y:0 },
          { x:1, y:0 },
          { x:-1, y:-1 },
          { x:0, y:-1 },
          { x:1, y:-1 },
        ]

        for (const { x, y } of checkData) {
          const row = level.getRow( newPlayerPos.y + y )
          let tailsCount = 0
          let prevTailX = Infinity

          if (!row || row[ newPlayerPos.x + x ]?.getTop()) continue

          for (let i = newPlayerPos.x + x;  i < level.levelDimensions.x;  ++i) {
            const topTags = level.getCell( i, newPlayerPos.y + y )?.getTop()?.tags

            if (topTags?.has( `trail` ) || topTags?.has( `player` )) {
              if (prevTailX != i - 1) tailsCount++
              prevTailX = i
            }
          }

          if (tailsCount === 0) continue

          for (let i = 0;  i < newPlayerPos.x + x;  ++i) {
            const topTags = level.getCell( i, newPlayerPos.y + y )?.getTop()?.tags

            if (topTags?.has( `trail` ) || topTags?.has( `player` )) {
              if (prevTailX != i - 1) tailsCount++
              prevTailX = i
            }
          }

          if (tailsCount > 0) {
            const result = level.fillAreaWithLand( newPlayerPos.x + x, newPlayerPos.y + y )

            if (!result) {
              uiData.tooBigAreaInfo = true
            } else {
              const startExp = uiData.experience

              uiData.knownAreas += result
              uiData.closedAreas++

              for (let i = 600;  i < result;  i += 600) {
                uiData.expincomeGood = true
                uiData.experience++
              }

              if (uiData.closedAreas === 1) {
                uiData.speed++
                uiData.experience++
              } else if (uiData.closedAreas === 5) {
                uiData.experience++
              } else if (uiData.closedAreas === 10) {
                uiData.speed++
                uiData.experience++
              } else if (uiData.closedAreas === 20) {
                uiData.experience++
              } else if (uiData.closedAreas === 40) {
                uiData.speed++
                uiData.experience++
              }

              if (uiData.experience - startExp > 2) uiData.speed += Math.floor( (uiData.experience - startExp) / 3 )

              if (this.debug) {
                if (startExp < 2 && uiData.experience >= 2) {
                  level.removeTagged( `border-1` )
                  uiData.stage = 2
                  uiData.speed++
                }
                if (startExp < 2 && uiData.experience >= 2) {
                  level.removeTagged( `border-1` )
                  uiData.stage = 2
                  uiData.speed++
                }
              } else {
                if (uiData.stage < 2 && startExp <= 7 && uiData.experience >= 7) {
                  level.removeTagged( `border-1` )
                  uiData.experience++
                  uiData.stage = 2
                  uiData.speed++
                }
                if (uiData.stage == 2 && uiData.knownAreas > 14000) {
                  uiData.visibleScore = true
                  level.removeTagged( `border-2` )
                  uiData.experience++
                  uiData.stage = 3
                  uiData.speed++
                }
              }

              break
            }

            this.calcScore()
            this.updateUi()
          }
        }
      }
    }
  }

  calcScore() {
    const ud = this.uiData
    ud.score = Math.floor( (ud.closedAreas * 20  +  ud.knownAreas * 1  +  ud.knownTiles * 10  +  ud.experience * 100) * (1 + ud.stage * 0.05) )
  }

  updateUiFlag( key:PickBools<typeof this.uiData>, state = true ) {
    if (this.uiData[ key ] === state) return

    this.uiData[ key ] = state
    this.updateUi()
  }
}
