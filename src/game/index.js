import React from "react"
// import { useStaticQuery, graphql } from "gatsby"
// import Img from "gatsby-image"

import { Entity, Player, Rock } from "./entities.js"
import levels, { Level } from "./levels.js"
import keys from "./keys.js"

import * as classes from "./main.module.css"

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

export default class extends React.Component {
  #indev = false

  /** @type {Entity[]} */
  entities = []

  intervals = {
    every1s: 0,
    main: 0,
  }

  /** @type {null|Level} */
  level = null

  /** @type {null|CanvasRenderingContext2D} */
  ctx = null

  player = new Player()

  gameState = STATE.PRE_START

  /** @type {null|CanvasRenderingContext2D} */
  offscreenCtx = null


  /** @param {HTMLCanvasElement} canvas */
  #init = canvas => {
    if (!canvas) return

    const offscreenCanvas = document.createElement( `canvas` )
    this.offscreenCtx = offscreenCanvas.getContext( `2d` )

    this.ctx = canvas.getContext( `2d` )

    this.#resize()
    this.start()

    this.initlevel( 0 )
  }


  pause = () => {
    this.gameState = STATE.PAUSE
    this.paused = true
  }


  resume = () => {
    this.gameState = STATE.RUNNING
    this.paused = false
  }


  componentWillUnmount = () => this.stop()


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

      if (this.paused || !this.offscreenCtx || !this.level) return
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

    entities.splice( 0 )
    player.visible = false
  }


  initlevel = (onlyRestart = false) => {
    this.clearLevelState()

    // this.level = levels[ levelId ]

    if (!onlyRestart) this.level = new Level({
      speed: 1,
      map: Level.generateMap( 30 ),
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

    this.level.distanceY = 0
    this.level.generatebackground( this.offscreenCtx )
    this.level.init( this )
    this.gameState = STATE.RUNNING
  }


  #resize = () => {
    const { canvas } = this.ctx

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    this.offscreenCtx.canvas.width  = canvas.offsetWidth
    this.offscreenCtx.canvas.height = canvas.offsetHeight
  }


  #logic1s = () => {
    // this.player.setAngle( Math.floor( Math.random() * 360 ) )
  }


  #levelEnd = () => {
    console.log( `end` )
    this.gameState = STATE.LEVEL_END

    setTimeout( () => this.initlevel( true ), 1000 * 5 )
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
    const { ctx, player, entities, level } = this
    const { width, height } = ctx.canvas
    const mapDistanceY = height - level.height + level.distanceY

    ctx.clearRect( 0, 0, width, height )
    ctx.drawImage( this.offscreenCtx.canvas, 0, mapDistanceY )

    entities.forEach( entity => entity.draw( ctx, this.#indev ) )

    player.draw( ctx, this.#indev )
  }


  render = () => {
    return (
      <article>
        <canvas ref={this.#init} className={classes.canvas} />
      </article>
    )
  }
}
