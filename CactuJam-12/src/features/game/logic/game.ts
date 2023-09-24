import { Primitive } from "@lib/theming/types"
import { GameColors, Point } from "./types"
import Level from "./level"
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
    closedAreas: 0,
    usedW: false,
    usedS: false,
    usedA: false,
    usedD: false,
  }

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
    const { keys, level, ticks } = this
    this.ticks++

    if (!level) return

    const playerTileInfo = level.getPlayerTile()
    let newPlayerPos:undefined | Point = undefined

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

    // if (keys.isPressedOnce( `w` )) newPlayerPos = level.movePlayerBy( 0, 1 )
    // if (!newPlayerPos && keys.isPressedOnce( `s` )) newPlayerPos = level.movePlayerBy( 0, -1 )
    // if (!newPlayerPos && keys.isPressedOnce( `a` )) newPlayerPos = level.movePlayerBy( -1, 0 )
    // if (!newPlayerPos && keys.isPressedOnce( `d` )) newPlayerPos = level.movePlayerBy( 1, 0 )

    if (newPlayerPos) {
      level.createTile( playerTileInfo.x, playerTileInfo.y, `trail` )
      const ngbrs = level.getCellNeighbours( newPlayerPos.x, newPlayerPos.y )

      if (Object.values( ngbrs ).filter( Boolean ).length > 1) {
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

          if (row[ newPlayerPos.x + x ]?.getTop()) continue

          for (let i = newPlayerPos.x + x;  i < row.length;  ++i) {
            if (row[ i ]?.getTop()?.tags.has( `trail` )) {
              if (prevTailX != i - 1) tailsCount++
              prevTailX = i
            }
          }

          if (tailsCount === 0) continue

          for (let i = 0;  i < newPlayerPos.x + x;  ++i) {
            if (row[ i ]?.getTop()?.tags.has( `trail` )) {
              if (prevTailX != i - 1) tailsCount++
              prevTailX = i
            }
          }

          if (tailsCount > 0) {
            const result = level.fillAreaWithLand( newPlayerPos.x + x, newPlayerPos.y + y )

            if (result) {
              console.log( `done`, { x:newPlayerPos.x + x, y:newPlayerPos.y + y } )
              this.uiData.closedAreas++
              this.updateUi()
              break
            }
          }
        }
      }
    }

    level.logic( this.ctx )

    if (!(ticks % 60)) console.log( newPlayerPos ?? playerTileInfo )
  }

  updateUiFlag( key:PickBools<typeof this.uiData>, state = true ) {
    if (this.uiData[ key ] === state) return

    this.uiData[ key ] = state
    this.updateUi()
  }
}
