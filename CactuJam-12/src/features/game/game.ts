import { GameColors, Point } from "./types"
import Level from "./level"
import Game from "./controller"
import KeysController from "./KeysController"

export type GameConfig = {
  colors: GameColors
}

export default class CactuJam12Game extends Game {
  keys = new KeysController()

  level: null | Level = null
  ctx: CanvasRenderingContext2D
  colors: GameColors

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

  async logic() {
    const { keys, level } = this

    if (!level) return

    const playerTileInfo = level.getPlayerTile()
    let newPlayerPos:undefined | Point = undefined

    if (keys.isPressed( `w` )) newPlayerPos = level.movePlayerBy( 0, 1 )
    if (!newPlayerPos && keys.isPressed( `s` )) newPlayerPos = level.movePlayerBy( 0, -1 )
    if (!newPlayerPos && keys.isPressed( `a` )) newPlayerPos = level.movePlayerBy( -1, 0 )
    if (!newPlayerPos && keys.isPressed( `d` )) newPlayerPos = level.movePlayerBy( 1, 0 )
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

          console.log( 1, { tailsCount } )
          if (tailsCount === 0) continue

          for (let i = 0;  i < newPlayerPos.x + x;  ++i) {
            if (row[ i ]?.getTop()?.tags.has( `trail` )) {
              if (prevTailX != i - 1) tailsCount++
              prevTailX = i
            }
          }

          console.log( 2, { tailsCount } )
          if (tailsCount > 0) {
            console.log( `newPlayerPos`, { newPlayerPos, x:newPlayerPos.x + x, y:newPlayerPos.y + y } )
            const result = level.fillAreaWithLand( newPlayerPos.x + x, newPlayerPos.y + y )

            console.log( result )

            if (result) {
              console.log( `done`, { x:newPlayerPos.x + x, y:newPlayerPos.y + y } )
              break
            }
          }
        }
      }
    }
  }
}
