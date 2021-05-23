import React from "react"
// import { useStaticQuery, graphql } from "gatsby"
// import Img from "gatsby-image"

import { Entity, Player, Rock } from "./entities.js"
import levels, { Level } from "./levels.js"
import keys from "./keys.js"

import * as classes from "./main.module.css"
import { getDate } from "./utils.js"
import Effect from "./effects.js"

// const query = graphql`
//   query {
//     car: file( relativePath:{ eq:"car_black_1.png" } ) {
//       childImageSharp {
//         fluid( maxWidth:500 ) { ...GatsbyImageSharpFluid }
//       }
//     }
//   }
// `

const STATE = {
  PAUSE: 0,
  RUNNING: 1,
  LEVEL_END: 2,
  END: 3,
  PRE_START: 4,
}
const SCREENS = {
  LEVEL_SUMMARY: 0,
  CHECK_LUCK: 1,
}

export default class extends React.Component {
  #indev = false

  /** @type {Entity[]} */
  entities = []

  intervals = {
    every1s: 0,
    main: 0,
  }

  /** @type {Effect[]} */
  effects = [ new Effect( Effect.EFFECTS.BLIND, 0 ) ]

  state = {
    statsPoints: 0,
    statsTime: 0,
    statsPointsSum: 0,
    statsTimeSum: 0,
    significantNumber: null,
    chanceLuck: null,
    chanceBadLuck: null,
    buttonClickable: false,
    time: 0,
    showedScreen: null,
  }

  /** @type {null|Level} */
  level = null
  levelNumber = 0

  /** @type {null|CanvasRenderingContext2D} */
  ctx = null
  /** @type {null|CanvasRenderingContext2D} */
  helpingCtx = null
  /** @type {null|CanvasRenderingContext2D} */
  offscreenCtx = null

  player = new Player()

  gameState = STATE.PRE_START


  /** @param {HTMLCanvasElement} canvas */
  #init = canvas => {
    if (!canvas) return

    const offscreenCanvas = document.createElement( `canvas` )
    this.offscreenCtx = offscreenCanvas.getContext( `2d` )

    this.ctx = canvas.getContext( `2d` )

    this.#resize()
    this.start()

    this.initlevel( 0 )

    window.addEventListener( `resize`, this.#resize )
  }


  /** @param {HTMLCanvasElement} canvas */
  #setHelpingCtx = canvas => {
    if (!canvas) return

    this.helpingCtx = canvas.getContext( `2d` )

    this.#resize()
  }


  #resize = () => {
    const { canvas } = this.ctx

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    this.offscreenCtx.canvas.width  = canvas.offsetWidth
    this.offscreenCtx.canvas.height = canvas.offsetHeight

    if (this.level) this.level.generatebackground( this.offscreenCtx )

    if (this.helpingCtx) {
      this.helpingCtx.canvas.width  = canvas.offsetWidth
      this.helpingCtx.canvas.height = canvas.offsetHeight
    }
  }


  pause = () => {
    this.gameState = STATE.PAUSE
    this.paused = true
  }


  resume = () => {
    this.gameState = STATE.RUNNING
    this.paused = false
  }


  componentWillUnmount = () => {
    window.removeEventListener( `resize`, this.#resize )
    this.stop()
  }


  stop = () => {
    const { intervals } = this

    cancelAnimationFrame( intervals.main )
    clearInterval( intervals.every1s )
  }


  start = () => {
    this.intervals.every1s = setInterval( this.#logic1s, 1000 )
    this.gameState = STATE.RUNNING

    const loop = () => {
      this.intervals.main = requestAnimationFrame( loop )

      if (this.paused || !this.helpingCtx || !this.offscreenCtx || !this.level) return
      if (this.gameState == STATE.RUNNING) {
        this.#logic()
        this.#draw()
      }

      // requestAnimationFrame( this.#draw )
    }

    loop()
  }


  clearLevelState = () => {
    const { entities, player } = this

    this.setState({ statsPoints:0, statsTime:0 })

    entities.splice( 0 )
    player.visible = false
  }


  initlevel = (onlyRestart = false) => {
    this.setState({ showedScreen:null })
    this.clearLevelState()

    // this.level = levels[ levelId ]

    if (!onlyRestart) {
      this.levelNumber++
      this.level = new Level({
        speed: 1,
        map: Level.generateMap( 100 ),
        init: game => {
          const { ctx, player, entities } = game
          const { width, height } = ctx.canvas
          const random = max => Math.floor( Math.random() * max )

          player.visible = true
          player.moveTo( width / 2, height - 200 )

          for (let i = 0;  i < 30;  ++i) {
            entities.push( new Rock( random( width ), random( height ) ) )
          }
        },
      })
    }

    this.level.distanceY = 0
    this.level.generatebackground( this.offscreenCtx )
    this.level.start( this )
    this.gameState = STATE.RUNNING
  }


  #logic1s = () => {
    // this.player.setAngle( Math.floor( Math.random() * 360 ) )
  }


  #levelEnd = async() => {
    const { level } = this

    this.gameState = STATE.LEVEL_END

    this.setState({
      showedScreen: SCREENS.LEVEL_SUMMARY,
      buttonClickable: false,
    })

    const _count = (resolve, stateProp, max, value = 0) => {
      if (value > max) value = max

      this.setState({ [ stateProp ]:value })

      if (value < max) setTimeout( () => _count( resolve, stateProp, max, value + 9 ), 1 )
      else resolve()
    }
    const count = (stateProp, max, value) =>
      new Promise( r => _count( r, stateProp, Math.floor( max ), value ))

    await count( `statsTime`, new Date( Date.now() - level.startTime ).getTime() )
    await count( `statsPoints`, level.earnedPoints * 10 + 100 * this.levelNumber )

    this.setState( old => {
      return ({
        statsPointsSum: old.statsPointsSum + old.statsPoints,
        statsTimeSum: old.statsTimeSum + old.statsTime,
        buttonClickable: true,
      }) } )

    // setTimeout( () => this.initlevel( true ), 1000 * 5 )
  }


  #checkLuck = async() => {
    this.setState({
      significantNumber: null,
      chanceLuck: null,
      chanceBadLuck: null,
      showedScreen: SCREENS.CHECK_LUCK,
      buttonClickable: false,
    })

    let randomNum = 0

    const _draw = (resolve, i = 100) => {
      const randNum = Math.floor( Math.random() * 100 ) / 100
      this.setState({ significantNumber:randNum  })

      if (i > 0) return setTimeout( () => _draw( resolve, i - 1 ), 20 / (i + 3) * 300 )

      resolve()
      randomNum = randNum

    }

    const draw = () => new Promise( r => _draw( r ))

    await draw()

    this.setState({
      chanceLuck: randomNum,
      chanceBadLuck: 1 - randomNum,
      buttonClickable: true,
    })
  }


  #nextLevel = () => {
    this.setState({ showedScreen:null })
    this.initlevel()
  }


  #logic = () => {
    const { player, entities, level } = this
    const { width, height } = this.ctx.canvas
    const playerOnMapX =  Math.floor( (player.x - (width - level.width) / 2) / level.roadSize )
    const playerOnMapY =  Math.floor( ((height - player.y) + level.distanceY) / level.roadSize )
    const moduloDistanceY = height - level.height + level.distanceY
    const additionalSpeed = 2 * (1 - player.y / height)
    const speed = level.speed + additionalSpeed

    if (moduloDistanceY >= 0) return this.#levelEnd()

    // if (keys.getkey( `w` )) player.setVelocity( 2 )
    // else if (keys.getkey( `s` )) player.setVelocity( 0 )
    // else player.setVelocity( 1 )

    // if (keys.getkey( `a` )) player.setAngle( player.angle - 1 )
    // else if (keys.getkey( `d` )) player.setAngle( player.angle + 1 )

    if (keys.getkey( `w` ) && player.y > player.height) {
      player.y -= speed
    } else if (keys.getkey( `s` ) && player.y < height - player.height) {
      player.y += speed
    }

    if (keys.getkey( `a` )) {
      player.setAngle( -45 )
      player.x -= speed
    } else if (keys.getkey( `d` )) {
      player.setAngle( 45 )
      player.x += speed
    } else {
      player.setAngle( 0 )
    }

    // player.y += 1

    let collision = false

    if (!level.isDrivableArea( playerOnMapX, playerOnMapY )) collision = true

    for (const entity of entities) {
      entity.y += speed

      if (entity.y > height + entity.height) {
        entity.x = Math.floor( Math.random() * width )
        entity.y = -entity.height
      }

      if (!collision && player.isCollision( entity )) collision = true
    }

    if (collision) {
      console.log( `collision` )
    }

    level.tick( additionalSpeed )
    player.doTick()
  }


  #draw = () => {
    const { ctx, helpingCtx, player, entities, effects, level } = this
    const { width, height } = ctx.canvas
    const mapDistanceY = height - level.height + level.distanceY

    ctx.clearRect( 0, 0, width, height )
    ctx.drawImage( this.offscreenCtx.canvas, 0, mapDistanceY )

    entities.forEach( entity => entity.draw( ctx, this.#indev ) )

    player.draw( ctx, this.#indev )

    effects.forEach( ({ type, value }) => {
      switch (type) {
        case Effect.EFFECTS.BLIND: {
          helpingCtx.fillStyle = `#000`
          helpingCtx.fillRect( 0, 0, width, height )

          helpingCtx.globalCompositeOperation = `destination-out`

          helpingCtx.beginPath()
          helpingCtx.arc( player.x, player.y, player.height * (10 - value), 0, Math.PI * 2 )
          helpingCtx.fill()

          helpingCtx.globalCompositeOperation = `source-over`

          break
        }
      }
    } )
  }


  render = () => {
    const {
      statsTime,
      statsPoints,
      statsPointsSum,
      statsTimeSum,
      significantNumber,
      chanceLuck,
      chanceBadLuck,
      buttonClickable,
    } = this.state

    return (
      <article>
        <canvas ref={this.#init} className={classes.canvas} />
        <canvas ref={this.#setHelpingCtx} className={classes.canvas} />

        {this.state.showedScreen == SCREENS.LEVEL_SUMMARY && (
          <article className={classes.screen}>
            <div className={classes.screeenWrapper}>
              <h2 className={classes.screenTitle}>Poziom ukończony!</h2>

              <div className={classes.screenContent}>
                <ul className={classes.screenStats}>
                  {
                    [
                      { key:`Czas`, current:statsTime, sum:statsTimeSum },
                      { key:`Punkty`, current:statsPoints, sum:statsPointsSum },
                    ].map( ({ key, current, sum }) => (
                      <li key={key} className={classes.screenStatsItem}>
                        {!current ? null : (
                          <>
                            <span className={classes.screenStatsItemCurrent}>
                              {key}
                              {`: `}
                              {current}
                            </span>
                            <span className={classes.screenStatsItemSum}>
                              Suma:
                              {` `}
                              {sum}
                            </span>
                          </>
                        )}
                      </li>
                    ) )
                  }
                </ul>

                <button
                  className={`neumorphizm is-button ${classes.buttonNext}`}
                  onClick={() => this.#checkLuck()}
                  children="Sprawdź swoje szczęście"
                  disabled={!buttonClickable}
                />
              </div>
            </div>
          </article>
        )}

        {this.state.showedScreen == SCREENS.CHECK_LUCK && (
          <article className={classes.screen}>
            <div className={classes.screeenWrapper}>
              <h2 className={classes.screenTitle}>Poziom ukończony!</h2>

              <div className={classes.screenContent}>
                <h3>Nowa liczba znacząca</h3>
                <span className={classes.significantNumber}>{significantNumber}</span>

                <br />

                {chanceLuck && <p>Oznacza ona...</p>}
                <ul className={classes.screenStats}>

                  <li className={classes.screenStatsItem}>
                    {chanceLuck ? ` ...szansę na szczęście: ${Math.round( chanceLuck * 100 )}%` : null}
                  </li>
                  <li className={classes.screenStatsItem}>
                    {chanceBadLuck ? ` ...szansę na pecha ${Math.round( chanceBadLuck * 100 )}%` : null}
                  </li>
                </ul>

                <br />

                <button
                  className={`neumorphizm is-button ${classes.buttonNext}`}
                  onClick={() => this.#nextLevel()}
                  children="Kolejny poziom"
                  disabled={!buttonClickable}
                />
              </div>
            </div>
          </article>
        )}
      </article>
    )
  }
}
