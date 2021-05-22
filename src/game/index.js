import React from "react"
// import { useStaticQuery, graphql } from "gatsby"
// import Img from "gatsby-image"

import * as classes from "./main.module.css"
import Player from "./entities.js"


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

  intervals = {
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
  stop = () => clearInterval( this.intervals.main )
  start = () => {
    this.intervals.main = setInterval( () => {
      if (this.paused) return

      this.#draw()
    }, this.#indev ? 100 : 1000 / 60 )
  }


  initlevel = levelId => {
    const { player } = this

    player.visible = true
  }


  #resize = () => {
    const { canvas } = this.ctx

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }


  #draw = () => {
    const { ctx, player } = this
    const { width, height } = ctx.canvas

    ctx.strokeStyle = `white`
    ctx.lineWidth = 5
    ctx.rect( 0, 0, width, height )
    ctx.stroke()


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
