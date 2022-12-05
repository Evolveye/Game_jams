import LevelCell from "@lib/gameEngine/logic/Level/LevelCell"
import Level from "@lib/gameEngine/logic/Level"
import { Game, Keys } from "@lib/gameEngine"
import select from "@lib/core/functions/select"
import { getDateparts } from "@lib/core/functions/formatDate"
import wavTheme from "../wav/theme.wav"
import wavJump from "../wav/jump.wav"
import wavGameOver from "../wav/gameOver.wav"
import { level01 } from "./level/01"
import { templates } from "./level"
import GameStatus, { type GameStatus as GameStatusType } from "./Status"

export const Season = {
  SPRING: `spring`,
  SUMMER: `summer`,
  AUTUMN: `autumn`,
  WINTER: `winter`,
}

export default class CactuJam11Game extends Game<GameStatusType> {
  static defaultSettings = {
    ticksToNewRow: Math.floor( 1000 / 30 ),
    mapBaseWidth: 10,
    probabilityOfBadTile: 0.005,
    currentSeason: Season.SUMMER,
    seasonSpritesTemplates: {
      spring: {
        good: [ templates.grassBlock, templates.grassBlock, templates.grassBlock, templates.grassBlock, templates.grassBlock, templates.grassFlowersBlock ],
        bad: [ templates.waterBlock ],
        badUp: [ templates.grassBlock, templates.grassFlowersBlock ],
      },
      summer: {
        good: [ templates.grassBlock ],
        bad: [ templates.waterBlock ],
        badUp: [ templates.sunflower, templates.grassBlock, templates.grassFlowersBlock ],
      },
      autumn: {
        good: [ templates.grassAutumn1Block, templates.grassAutumn1Block, templates.grassAutumn1Block, templates.grassAutumn2Block, templates.grassAutumn3Block ],
        bad: [ templates.waterBlock ],
        badUp: [ templates.grassAutumn1Block, templates.grassAutumn2Block, templates.grassAutumn3Block ],
      },
      winter: {
        good: [ templates.snowBlock ],
        bad: [ templates.iceBlock ],
        badUp: [ templates.iceSpikes, templates.snowBlock ],
      },
    },
    translate: {
      x: 0,
      y: 0,
      offset: {
        x: 0,
        y: 0,
      },
    },
  }

  distance = 0
  ctx: CanvasRenderingContext2D
  keys = new Keys()
  level: null | Level<CactuJam11Game> = null
  startCeilsCount = 10

  settings = CactuJam11Game.defaultSettings
  ui: {
    date: HTMLElement
    season: HTMLElement
  }
  sounds = {
    theme: new Audio( wavTheme ),
    gameOver: new Audio( wavGameOver ),
  }

  constructor( preGameUI:HTMLElement ) {
    super( preGameUI, GameStatus.NOT_STARTED )

    this.ctx = this.getCtxFromCanvas( `[data-canvas-main]` )
    this.ui = {
      date: this.getUI( `[data-stats-date]` ),
      season: this.getUI( `[data-stats-season]` ),
    }

    this.on( `status update`, this.onStatus )
  }

  draw = () => {
    const { ctx, level, settings } = this

    if (!level) return

    const { ticksToNewRow, translate } = settings
    const { width, height } = ctx.canvas

    ctx.clearRect( 0, 0, width, height )
    ctx.save()

    if (!level.data) return

    translate.x += -(1 / ticksToNewRow) * (level.tileSize)
    translate.y +=  (1 / ticksToNewRow) * (level.tileSize / 2 - 10)

    ctx.translate(
      translate.x,
      translate.y - translate.offset.y,
      // translate.x - 250,
      // translate.y - translate.offset.y + 500,
    )
    level.draw( ctx, translate )
    ctx.restore()
  }

  calculate = () => {
    const { ticks, level, distance, ctx, settings } = this

    if (!level) return

    const { height } = ctx.canvas
    const { data, tileSize } = level
    const { translate, ticksToNewRow } = settings

    if (!data) return

    const playJumpAudio = () => new Audio( wavJump ).play()

    if (this.keys.isActiveOnce( `w` ) || this.keys.isActiveOnce( `ArrowUp` )) {
      playJumpAudio()
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y -= 1
        if (e.y % 2 == 0) e.x += 1
      } )
    } else if (this.keys.isActiveOnce( `a` ) || this.keys.isActiveOnce( `ArrowLeft` )) {
      playJumpAudio()
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y -= 1
        if (e.y % 2 == -1) e.x -= 1
      } )
    } else if (this.keys.isActiveOnce( `s` ) || this.keys.isActiveOnce( `ArrowDown` )) {
      playJumpAudio()
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y += 1
        if (e.y % 2 == -1) e.x -= 1
      } )
    } else if (this.keys.isActiveOnce( `d` ) || this.keys.isActiveOnce( `ArrowRight` )) {
      playJumpAudio()
      level.getEntities( e => e.templateId === `p` ).forEach( e => {
        e.y += 1
        if (e.y % 2 == 0) e.x += 1
      } )
    }

    let playerHasBeenRemoved = false
    const outOfScreenBase = -translate.x / tileSize - 2
    level.getEntitiesOnWrongTile( e => e.x > outOfScreenBase ).forEach( e => {
      if (e.templateId === `p`) playerHasBeenRemoved = true

      level.removeEntity( e )
    } )

    if (playerHasBeenRemoved && level.getEntities( e => e.templateId === `p` ).length === 0) {
      return this.changeStatus( GameStatus.GAME_OVER )
    }

    if (ticks % ticksToNewRow == 0) {
      const dayOfYear = distance % 365
      const correctedTileSize = tileSize / 2 - 10

      if (distance <= 100) {
        if (distance === 10) {
          this.settings.probabilityOfBadTile = 0.01
        } else if (distance === 20) {
          this.settings.probabilityOfBadTile = 0.02
        } else if (distance === 50) {
          this.settings.probabilityOfBadTile = 0.04
        } else if (distance === 100) {
          this.settings.probabilityOfBadTile = 0.06
        }
      } else if (distance % 75 === 0) {
        this.settings.probabilityOfBadTile += 0.015
        this.settings.ticksToNewRow -= 2

        console.log( `SPEEED!`, {
          probabilityOfBadTile: this.settings.probabilityOfBadTile,
          ticksToNewRow: this.settings.ticksToNewRow,
        } )
      }

      if (dayOfYear === 60) {
        console.log( `SPRING TIME!`, { dayOfYear } )
        settings.currentSeason = Season.SPRING
      } else if (dayOfYear === 152) {
        console.log( `SUMMER TIME!`, { dayOfYear } )
        settings.currentSeason = Season.SUMMER
      } else if (dayOfYear === 244) {
        console.log( `AUTUMN TIME!`, { dayOfYear } )
        settings.currentSeason = Season.AUTUMN
      } else if (dayOfYear === 335) {
        console.log( `WINTER TIME!`, { dayOfYear } )
        settings.currentSeason = Season.WINTER
      }

      this.distance++
      this.spawnRow()

      if (data.length > (height + translate.offset.y * 2) / correctedTileSize) level.prune( 4 )
    }

    this.updateUI()

    // if (data.length > 50) for (let i = 6;  i > 0;  --i) data.pop()

    // this.startCeilsCount += Math.random() > 0.5 ? 1 : -1

    // if (this.startCeilsCount > maxCeilsCount) this.startCeilsCount = maxCeilsCount
    // else if (this.startCeilsCount < minCeilsCount) this.startCeilsCount = minCeilsCount

    // for (let i = 0;  i < rows;  ++i) {
    //   if (i % 2) data[ i ]?.shift()
    // }

    // if (data.length > rows / 2) for (let i = Math.floor( rows / 2 );  i < data.length;  ++i) {
    //   if (data[ i ].length) {
    //     const index = data[ i ].findIndex( c => c.tiles.length )

    //     if (index === -1) data.pop()
    //     else {
    //       const cell = data[ i ][ index ]

    //       if (cell) cell.tiles = []
    //     }
    //   } else data.pop()
    // }
  }

  updateUI = () => {
    const dateParts = getDateparts( 1000 * 60 * 60 * 24 * this.distance )

    this.ui.date.innerHTML = `${dateParts.day} ${dateParts.month} N` + `${Number( dateParts.year ) - 1970}`.padStart( 3, `0` )
    this.ui.season.innerHTML = select( this.settings.currentSeason, {
      spring: `Wiosna`,
      summer: `Lato`,
      autumn: `Jesień`,
      winter: `Zima`,
      default: ``,
    } )
  }

  start = () => {
    this.level = level01
    this.level.init( this )
    this.settings = CactuJam11Game.defaultSettings
    this.settings.translate.x = this.ctx.canvas.width
    this.settings.translate.offset.y = this.level.tileSize * 1
    this.spawnRow()

    this.changeStatus( GameStatus.STARTED )
    this.startLoop()

    const levelData = this.level.data
    if (!levelData) return
    const cell = levelData[ levelData.length - 1 ][ Math.floor( levelData[ 0 ].length / 2 ) ]

    this.level.entities.push( templates.player.createEntity( cell.x, cell.y, 1 ) )

    this.sounds.theme.play()
    this.sounds.theme.loop = true
  }

  onResize = () => {
    const { canvas } = this.ctx

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    this.ctx.imageSmoothingEnabled = false
  }

  onStatus = (status:GameStatusType) => {
    console.log( status )

    if (status === GameStatus.GAME_OVER) {
      this.stopLoop()
      this.sounds.gameOver.play()
      this.sounds.theme.currentTime = 0
      this.sounds.theme.pause()
    }
  }

  //

  spawnRow = () => {
    const { startCeilsCount, distance, level, settings } = this
    const baseWidth = settings.mapBaseWidth
    const padding = Math.floor( Math.random() * 3 )
    const seasonTemplates = settings.seasonSpritesTemplates[ settings.currentSeason ]
    // console.log( padding )

    const randomArrItem = (arr:any[]) => arr[ Math.floor( Math.random() * arr.length ) ]
    const getBadTileProbability = (mult:number = 1) => Math.random() < settings.probabilityOfBadTile * mult
    const getTiles = (x:number, y:number) => {
      const template = getBadTileProbability() ? randomArrItem( seasonTemplates.bad ) : randomArrItem( seasonTemplates.good )
      const tiles = [ template.createTile( x, y, 0, 1 ) ]

      if (distance > 100) {
        if (getBadTileProbability( settings.currentSeason === `winter` ? 0.75 : 0.25 )) {
          tiles.push( randomArrItem( seasonTemplates.badUp ).createTile( x, y, 1, 1 ) )
        }
      }

      return tiles
    }

    level?.data?.unshift( Array.from(
      { length:padding + startCeilsCount + baseWidth },
      (_, i) => {
        const x = i + distance
        const y = -distance
        const tiles = i < padding ? [] : getTiles( x, y )

        return new LevelCell( x, y, tiles )
      },
    ) )
  }
}
