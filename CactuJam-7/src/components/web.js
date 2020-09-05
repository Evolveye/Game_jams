import React from "react"

import WebCell from "./WebCell"
import Spider from "./Spider"

export default class Web extends React.Component {
  width = window.innerWidth
  height = window.innerHeight
  /** @type {HTMLCanvasElement} */
  canvas = null
  /** @type {CanvasRenderingContext2D} */
  ctx = null
  loopId = 0
  keys = []

  /** @type {WebCell|Spider[][][]} */
  level = [[]]
  webCellSize = 19
  offsetLeft = 0
  offsetTop = 0

  webColor = `white`

  componentDidMount() {
    this.handleResize()
    this.setDefaults()
    this.setEvents()
    this.startLoop()
    window.game = this
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
    const procents = [ 10, 20, 30, 40, 50, 60, 80, 100, 100 ].reverse()
    const center = Math.floor( procents.length / 2 )

    this.level = Array.from( { length:procents.length }, (_, y) =>
      Array.from( { length:procents.length }, (_, x) =>
        [ Math.random() > procents[ Math.abs( center - y ) + Math.abs( center - x ) ] / 100 ? null : new WebCell() ]
      )
    )
    this.player = new Spider( center, center )
    this.level[ center ][ center ].push( this.player )

    this.level.forEach( (row, y) => row.forEach( ([ webCell ], x) => {
      if (!webCell) return
      if (this.level[ y + 0 ]?.[ x - 1 ]?.some( cell => cell instanceof WebCell )) webCell.neighbours.left = true
      if (this.level[ y - 1 ]?.[ x + 0 ]?.some( cell => cell instanceof WebCell )) webCell.neighbours.top = true
      if (this.level[ y + 0 ]?.[ x + 1 ]?.some( cell => cell instanceof WebCell )) webCell.neighbours.right = true
      if (this.level[ y + 1 ]?.[ x + 0 ]?.some( cell => cell instanceof WebCell )) webCell.neighbours.bottom = true
    } ) )
  }
  setEvents() {
    document.addEventListener( `keydown`, ({ keyCode }) => this.keys[ keyCode ] = true )
    document.addEventListener( `keyup`, ({ keyCode }) => this.keys[ keyCode ] = false )
  }

  logic = () => {
    let longestRow = 0
    let moveX = 0
    let moveY = 0

    if (this.keys[ 37 ]) moveX -= 0.1
    if (this.keys[ 38 ]) moveY -= 0.1
    if (this.keys[ 39 ]) moveX += 0.1
    if (this.keys[ 40 ]) moveY += 0.1

    if (this.level?.[ Math.round( this.player.y + moveY ) ]?.[ Math.round( this.player.x + moveX ) ]?.some( cell => cell instanceof WebCell) ) {
      this.player.x += moveX
      this.player.y += moveY
    }

    this.level.forEach( row => row.length > longestRow && (longestRow = row.length) )

    this.offsetLeft = this.width / 2 - longestRow * this.webCellSize / 2
    this.offsetTop = this.height / 2 - this.level.length * this.webCellSize / 2
  }
  draw = () => {
    const { ctx, offsetLeft, offsetTop, webCellSize, width, height } = this

    ctx.clearRect( 0, 0, width, height )

    // Draw cells
    this.level.forEach( (row, y) => row.forEach( ([ webCell ], x) => {
      if (!webCell) return

      const { left, top, right, bottom } = webCell.neighbours

      const offsetX = offsetLeft + x * webCellSize
      const offsetY = offsetTop + y * webCellSize

      ctx.beginPath()

      ctx.moveTo( offsetX, offsetY + webCellSize / 2 )
      ctx.lineTo( offsetX + webCellSize, offsetY + webCellSize / 2 )

      ctx.moveTo( offsetX + webCellSize / 2, offsetY )
      ctx.lineTo( offsetX + webCellSize / 2, offsetY + webCellSize )

      ctx.strokeStyle = `#555`
      ctx.stroke()

      ctx.beginPath()

      if (!left) {
        ctx.moveTo( offsetX, offsetY )
        ctx.lineTo( offsetX, offsetY + webCellSize )
      }
      if (!top) {
        ctx.moveTo( offsetX, offsetY )
        ctx.lineTo( offsetX + webCellSize, offsetY )
      }
      if (!right) {
        ctx.moveTo( offsetX + webCellSize, offsetY )
        ctx.lineTo( offsetX + webCellSize, offsetY + webCellSize )
      }
      if (!bottom) {
        ctx.moveTo( offsetX, offsetY + webCellSize )
        ctx.lineTo( offsetX + webCellSize, offsetY + webCellSize )
      }
      ctx.strokeStyle = `#fff`
      ctx.stroke()
    } ) )

    ctx.fillStyle = `red`
    ctx.fillRect( offsetLeft + this.player.x * webCellSize, offsetTop + this.player.y * webCellSize, webCellSize, webCellSize )
  }
  render = () => <canvas ref={this.handleRef} className="game-web" />
}