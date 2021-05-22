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

export default class extends React.Component {
  #indev = true

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


  pause = () => this.paused = true
  resume = () => this.paused = false
  componentWillUnmount = () => this.stop()


  stop = () => {
    const { intervals } = this

    cancelAnimationFrame( intervals.main )
    clearInterval( intervals.every1s )
  }


  start = () => {
    this.intervals.every1s = setInterval( this.#logic1s, 1000 )

    const loop = () => {
      this.intervals.main = requestAnimationFrame( loop )

      if (this.paused || !this.offscreenCtx || !this.level) return

      this.#logic()
      this.#draw()
      // requestAnimationFrame( this.#draw )
    }

    loop()
  }


  initlevel = levelId => {
    const { entities, player, ctx } = this

    entities.splice( 0 )
    player.visible = false

    this.level = levels[ levelId ]
    this.level.init( this )
    this.level.generatebackground( this.offscreenCtx )
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


  #logic = () => {
    const { player, entities, level } = this
    const { width, height } = this.ctx.canvas

    level.tick()

    // if (keys.getkey( `w` )) player.setVelocity( 2 )
    // else if (keys.getkey( `s` )) player.setVelocity( 0 )
    // else player.setVelocity( 1 )

    // if (keys.getkey( `a` )) player.setAngle( player.angle - 1 )
    // else if (keys.getkey( `d` )) player.setAngle( player.angle + 1 )

    if (keys.getkey( `w` )) {
      player.y -= 1
    } else if (keys.getkey( `s` )) {
      player.y += 1
    }

    if (keys.getkey( `a` )) {
      player.setAngle( -45 )
      player.x -= 1
    } else if (keys.getkey( `d` )) {
      player.setAngle( 45 )
      player.x += 1
    } else {
      player.setAngle( 0 )
    }

    // player.y += 1

    let collision = false

    for (const entity of entities) {
      entity.y += level.speed

      if (entity.y > height + entity.height) {
        entity.x = Math.floor( Math.random() * 500 ) + 300
        entity.y = -entity.height
      } else if (player.isCollision( entity )) collision = true
    }

    if (collision) {
      console.log( `collision` )
    }

    player.doTick()
  }


  #draw = () => {
    const { ctx, player, entities, level } = this
    const { width, height } = ctx.canvas
    // const moduloDistanceY = level.distanceY - Math.floor( level.distanceY / height ) * height
    const moduloDistanceY = level.distanceY - Math.floor( level.distanceY / (height * 3) ) * height * 3

    ctx.clearRect( 0, 0, width, height )

    ctx.drawImage( this.offscreenCtx.canvas, 0, -height + moduloDistanceY )
    // ctx.drawImage( this.offscreenCtx.canvas, 0, moduloDistanceY )

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
