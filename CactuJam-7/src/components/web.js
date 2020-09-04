import React from "react"

import WebCell from "./WebCell"

export default class Web extends React.Component {
  width = window.innerWidth
  height = window.innerHeight
  centerX = this.width / 2
  centerY = this.height / 2
  /** @type {HTMLCanvasElement} */
  canvas = null
  /** @type {CanvasRenderingContext2D} */
  ctx = null
  loopId = 0

  /** @type {WebCell[][]} */
  level = [[]]
  webCellSize = 9

  temp = 0

  componentDidMount() {
    this.handleResize()
    this.setDefaults()
    this.startLoop()
  }

  startLoop() {
    this.loopId = setInterval( () => {
      this.logic()
      if (this.ctx) requestAnimationFrame( this.draw )
    }, 1000 / 60 )
  }
  stopLoop() {
    clearInterval( this.loopId )
  }

  handleResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.centerX = this.width / 2
    this.centerY = this.height / 2

    this.canvas.width = this.width
    this.canvas.height = this.height
  }
  /**  @param {HTMLCanvasElement} ref */
  handleRef = ref => {
    this.canvas = ref
    this.ctx = ref.getContext( `2d` )
  }
  setDefaults() {
    // % of tile creation
    this.level = [ 10, 30, 60, 90, 60, 30, 10 ]
      .map( (procent, _, { length } ) => Array.from( { length }, () => Math.random() > procent / 100 ? null : new WebCell() ) )
  }

  logic = () => {

  }
  draw = () => {
    const { ctx, centerX, centerY } = this

    this.temp += 1

    ctx.fillStyle = `red`
    ctx.fillRect( centerX + this.temp, centerY, 10, 10 )
  }
  render = () => <canvas ref={this.handleRef} className="game-web" />
}