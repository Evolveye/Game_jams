import React from "react"

import { Cobweb, Wood, Grass } from "./movable"
import { Stone, Barrier } from "./walls"
import { Air } from "./air"
import Spider from "./Spider"

const pythagoras = (x1, y1, x2, y2) => Math.sqrt( (x2 - x1) ** 2 + (y2 - y1) ** 2 )

export default class Web extends React.Component {
  width = window.innerWidth
  height = window.innerHeight
  /** @type {HTMLCanvasElement} */
  canvas = null
  /** @type {CanvasRenderingContext2D} */
  ctx = null
  loopId = 0
  keys = []
  mouse = {
    _pressUsed: 0,
    x: null,
    y: null,
    pressed: false,
    get isFirstPressUse() {
      if (!this.pressed) return false

      this._pressUsed += 1

      return this._pressUsed - 1 === 0
    }
  }

  /** @type {(Cobweb|Spider)[][][]} */
  level = [[]]
  webCellSize = 19
  offsetLeft = 0
  offsetTop = 0

  gravitySpeed = 0.1
  webColor = `white`
  maxCobwebWidth = 200

  componentDidMount() {
    window.game = this
    this.handleResize()
    this.setDefaults()
    this.setEvents()
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

    this.canvas.width = this.width
    this.canvas.height = this.height
  }
  /** @param {HTMLCanvasElement} ref */
  handleRef = ref => {
    this.canvas = ref
    this.ctx = ref.getContext( `2d` )
  }
  setDefaults() {
    this.level = [
      [ `b`,`b`,`b`, `b`, `b`, `b`,  ...`b`.repeat( 50 ).split( `` ),`b`,`b`,`b` ],
      [ `b`,`a`,`a`, `a`, `a`, `a`,  ...`a`.repeat( 50 ).split( `` ),`a`,`a`,`b` ],
      ...Array.from( { length:15 }, () => [ `b`,`w`,`a`, `a`, `a`, `a`,  ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ] ),
      [ `b`,`w`,`a`, `a`, `a`, `a`,  ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ],
      [ `b`,`w`,`a`, `ca`,`ca`,`a`,  ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ],
      [ `b`,`w`,`ca`,`ca`,`a`, `ca`, ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ],
      [ `b`,`w`,`ca`,`ca`,`ca`,`a`,  ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ],
      [ `b`,`w`,`ca`,`ca`,`ca`,`ca`, ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ],
      [ `b`,`w`,`ca`,`a`, `ca`,`ca`, ...`a`.repeat( 50 ).split( `` ),`a`,`w`,`b` ],
      [ `b`,`w`,`cg`,`cg`,`g`, `g`,  ...`g`.repeat( 50 ).split( `` ),`g`,`w`,`b` ],
      [ `b`,`w`,`g`, `g`, `g`, `g`,  ...`g`.repeat( 50 ).split( `` ),`g`,`w`,`b` ],
      [ `b`,`b`,`b`, `b`, `b`, `b`,  ...`b`.repeat( 50 ).split( `` ),`b`,`b`,`b` ],
    ].map( row => row.map( char => {
      switch (char) {
        case `w`:  return [ new Wood() ]
        case `g`:  return [ new Grass() ]
        case `c`:  return [ new Cobweb() ]
        case `ca`: return [ new Air(), new Cobweb() ]
        case `cg`: return [ new Grass(), new Cobweb() ]
        case `s`:  return [ new Stone() ]
        case `b`:  return [ new Barrier() ]
        case `a`:  return [ new Air() ]
        default:   return []
      }
    } ) )

    this.player = new Spider( 3, this.level.length - 6 )

    this.level.forEach( (row, y) => row.forEach( (stack, x) => {
      const cobweb = stack.find( obj => obj instanceof Cobweb )

      if (!cobweb) return
      if (this.level[ y + 0 ]?.[ x - 1 ]?.some( cell => cell instanceof Cobweb )) cobweb.neighbours.left = true
      if (this.level[ y - 1 ]?.[ x + 0 ]?.some( cell => cell instanceof Cobweb )) cobweb.neighbours.top = true
      if (this.level[ y + 0 ]?.[ x + 1 ]?.some( cell => cell instanceof Cobweb )) cobweb.neighbours.right = true
      if (this.level[ y + 1 ]?.[ x + 0 ]?.some( cell => cell instanceof Cobweb )) cobweb.neighbours.bottom = true
    } ) )

    const size = 50


  }
  setEvents() {
    document.addEventListener( `keydown`, ({ keyCode }) => this.keys[ keyCode ] = true )
    document.addEventListener( `keyup`, ({ keyCode }) => this.keys[ keyCode ] = false )
    document.addEventListener( `pointerdown`, () => {
      this.mouse._pressUsed = 0
      this.mouse.pressed = true
    } )
    document.addEventListener( `pointerup`, () => this.mouse.pressed = false )
    document.addEventListener( `mousemove`, ({ clientX, clientY }) => {
      this.mouse.x = clientX
      this.mouse.y = clientY
    } )
  }

  logic = () => {
    let longestRow = 0
    let moveX = 0
    let moveY = 0

    if (this.keys[ 37 ] || this.keys[ 65 ]) moveX -= 0.1
    if (this.keys[ 38 ] || this.keys[ 87 ]) moveY -= 0.1
    if (this.keys[ 39 ] || this.keys[ 68 ]) moveX += 0.1
    if (this.keys[ 40 ] || this.keys[ 83 ]) moveY += 0.1
    if (this.mouse.isFirstPressUse) {

    }

    const nextPlayerCell = this.level?.[ Math.round( this.player.y + moveY ) ]?.[ Math.round( this.player.x + moveX ) ]

    if (!nextPlayerCell?.some( cell => cell instanceof Barrier )) {
      this.player.x += moveX
      this.player.y += nextPlayerCell?.some( cell =>
        cell instanceof Cobweb ||
        cell instanceof Grass ||
        cell instanceof Wood
      ) ? moveY : this.gravitySpeed
    }

    this.level.forEach( row => row.length > longestRow && (longestRow = row.length) )

    this.offsetLeft = this.width / 2 - longestRow * this.webCellSize / 2
    this.offsetTop = this.height / 2 - this.level.length * this.webCellSize / 2
  }
  draw = () => {
    const { ctx, offsetLeft, offsetTop, webCellSize, width, height, mouse, maxCobwebWidth } = this

    ctx.clearRect( 0, 0, width, height )

    // Draw cells
    this.level.forEach( (row, y) => row.forEach( (stack, x) => stack.forEach( obj => {
      const offsetX = offsetLeft + x * webCellSize
      const offsetY = offsetTop + y * webCellSize

      if (obj instanceof Wood) {
        ctx.fillStyle = `orange`
        ctx.fillRect( offsetX, offsetY, webCellSize + 1, webCellSize + 1 )
      } else if (obj instanceof Air) {
        ctx.fillStyle = `#00d6ff`
        ctx.fillRect( offsetX, offsetY, webCellSize + 1, webCellSize + 1 )
      } else if (obj instanceof Grass) {
        ctx.fillStyle = `green`
        ctx.fillRect( offsetX, offsetY, webCellSize + 1, webCellSize + 1 )
      } else if (obj instanceof Cobweb) {
        const { left, top, right, bottom } = obj.neighbours

        ctx.fillStyle = `#fff8`
        ctx.fillRect( offsetX, offsetY, webCellSize + 1, webCellSize + 1 )

        ctx.beginPath()

        ctx.moveTo( offsetX, offsetY + webCellSize / 2 )
        ctx.lineTo( offsetX + webCellSize, offsetY + webCellSize / 2 )

        ctx.moveTo( offsetX + webCellSize / 2, offsetY )
        ctx.lineTo( offsetX + webCellSize / 2, offsetY + webCellSize )

        ctx.strokeStyle = `#aaa`
        ctx.lineWidth = 2
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
        ctx.lineWidth = 3
        ctx.stroke()
      } else if (obj instanceof Stone) {

      }

    } ) ) )

    ctx.fillStyle = `red`

    const playerOffsetX = offsetLeft + this.player.x * webCellSize
    const playerOffsetY = offsetTop + this.player.y * webCellSize
    const webCellSizeBy3 = webCellSize / 3

    if ( mouse.x ) {
      ctx.strokeStyle = pythagoras( playerOffsetX + webCellSize / 2, playerOffsetY + webCellSize / 2, mouse.x, mouse.y ) < maxCobwebWidth
        ? `#0f0a`
        : `#f00a`

      ctx.beginPath()
      ctx.moveTo( playerOffsetX + webCellSize / 2, playerOffsetY + webCellSize / 2 )
      ctx.lineTo( mouse.x, mouse.y )
      ctx.stroke()

      ctx.strokeStyle = `#fffa`
      ctx.beginPath()
      ctx.arc( mouse.x, mouse.y, 15, 0, Math.PI * 2 )
      ctx.stroke()
    }

    ctx.fillRect( playerOffsetX, playerOffsetY, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX + webCellSizeBy3, playerOffsetY + webCellSizeBy3, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX + webCellSizeBy3 * 2, playerOffsetY + webCellSizeBy3 * 2, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX + webCellSizeBy3 * 2, playerOffsetY, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX, playerOffsetY + webCellSizeBy3 * 2, webCellSizeBy3, webCellSizeBy3 )
  }
  render = () => <canvas ref={this.handleRef} className="game-web" />
}