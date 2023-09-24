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
  keys = new KeysController()
  ticks = 0

  level: null | Level = null
  ctx: CanvasRenderingContext2D
  colors: GameColors

  uiData = {
    experience: 0,
    speed: 9,
    knownAreas: 0,
    knownTiles: 0,
    closedAreas: 0,
    stage: 0,
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

    if (!speedTick || ticks % speedTick === 0) this.logicBySpeed()
    if (!level) return

    level.logic( this.ctx )

    if (uiData.stage === 2) {
      if (!this.enemyTimerId) this.enemyTimerId = window.setTimeout( () => {
        const randInt = (min:number, max:number) => Math.floor( Math.random() * (max - min) ) + min

        const x = randInt( 0, level.levelDimensions.x )
        const y = randInt( 100, 400 )
        const currentCell = level.getCell( x, y )
        const topTags = currentCell?.getTop()?.tags

        if (topTags?.has( `deep land` )) {
          const result = level.destroyFilledLand( x, y )
          console.log( result )
        } else {
          level.createTile( x, y, `danger` )
        }

        this.enemyTimerId = null
      }, 3000 )
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

              if (uiData.experience - startExp > 3) uiData.speed += Math.floor( (uiData.experience - startExp) / 3 )

              // if (startExp <= 7 && uiData.experience >= 7) {
              //   level.removeTagged( `border-1` )
              //   uiData.experience++
              //   uiData.stage = 2
              // }

              if (startExp < 2 && uiData.experience >= 2) {
                level.removeTagged( `border-1` )
                uiData.stage = 2
              }

              break
            }

            this.updateUi()
          }
        }
      }
    }
  }

  updateUiFlag( key:PickBools<typeof this.uiData>, state = true ) {
    if (this.uiData[ key ] === state) return

    this.uiData[ key ] = state
    this.updateUi()
  }
}
