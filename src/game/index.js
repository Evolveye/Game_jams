import React from "react"
// import { useStaticQuery, graphql } from "gatsby"
// import Img from "gatsby-image"

import Player from "./entities.js"
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
  #indev = false

  intervals = {
    every1s: 0,
    main: 0,
  }

  /** @type {null|CanvasRenderingContext2D} */
  ctx = null

  player = new Player()


  /** @param {HTMLCanvasElement} canvas */
  #init = canvas => {
    if (!canvas) return

    this.ctx = canvas.getContext( `2d` )

    this.#resize()
    this.start()

    this.initlevel( -1 )
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

      if (this.paused) return

      this.#logic()
      this.#draw()
      // requestAnimationFrame( this.#draw )
    }

    loop()
  }


  initlevel = levelId => {
    const { ctx, player } = this
    const { width, height } = ctx.canvas

    player.visible = true
    player.moveTo( width / 2, height - 200 )
  }


  #resize = () => {
    const { canvas } = this.ctx

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }


  #logic1s = () => {
    this.player.setAngle( Math.floor( Math.random() * 360 ) )
  }


  #logic = () => {
    const { player } = this

    if (keys.getkey( `w` )) player.setAngle( 0 )
    else if (keys.getkey( `s` )) player.setAngle( 180 )
    else if (keys.getkey( `a` )) player.setAngle( 270 )
    else if (keys.getkey( `d` )) player.setAngle( 90 )

    player.doTick()
  }


  #draw = () => {
    const { ctx, player } = this
    const { width, height } = ctx.canvas

    ctx.clearRect( 0, 0, width, height )

    player.draw( ctx )
  }


  render = () => {
    return (
      <article>
        <canvas ref={this.#init} className={classes.canvas} />
      </article>
    )
  }
}
