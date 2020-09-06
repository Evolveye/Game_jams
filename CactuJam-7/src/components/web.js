import React from "react"

import { Cobweb, Wood, Grass } from "./movable"
import { Stone, Barrier } from "./walls"
import { Air } from "./air"
import Spider, { Housefly } from "./entities"

const pythagoras = (x1, y1, x2, y2) => Math.sqrt( (x2 - x1) ** 2 + (y2 - y1) ** 2 )
const randomBetween = (min, max) => min + Math.floor( (max - min) * Math.random() )

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
  entities = []
  viewfinderSize = 30

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

  levelCell( x, y ) {
    return this.level[ Math.round( y ) ]?.[ Math.round( x ) ]
  }

  logic = () => {
    const {
      level,
      gravitySpeed,
      offsetLeft,
      offsetTop,
      webCellSize,
      width,
      height,
      mouse,
      keys,
      player,
      entities,
      viewfinderSize,
      maxCobwebWidth,
    } = this

    let longestRow = 0
    let moveX = 0
    let moveY = 0

    if (!level) return
    if (keys[ 37 ] || keys[ 65 ]) moveX -= 0.1
    if (keys[ 38 ] || keys[ 87 ]) moveY -= 0.1
    if (keys[ 39 ] || keys[ 68 ]) moveX += 0.1
    if (keys[ 40 ] || keys[ 83 ]) moveY += 0.1
    if (mouse.isFirstPressUse) {
      player.shooting = true
      player.canShoot = false

      const cobWebRange = pythagoras( offsetLeft + player.x * webCellSize + webCellSize / 2, offsetTop + player.y * webCellSize + webCellSize / 2, mouse.x, mouse.y ) < maxCobwebWidth

      entities.filter( ({ x, y, size }) =>
        pythagoras( offsetLeft + x * webCellSize, offsetTop + y * webCellSize, mouse.x, mouse.y ) < size + viewfinderSize / 2 && cobWebRange
      ).forEach( entity => entity.hp -= 1 )

      setTimeout( () => {
        player.shooting = false
        player.canShoot = true
      }, 10 )
    }
    if (Math.random() <= 0.02) {
      entities.push( new Housefly( randomBetween( 3, level[ 0 ].length - 2 ), randomBetween( 2, level.length - 5 ), 5 ) )
    }

    const nextPlayerCell = this.levelCell( player.x + moveX, player.y + moveY )

    if (!nextPlayerCell?.some( cell => cell instanceof Barrier )) {
      this.player.x += moveX
      this.player.y += nextPlayerCell?.some( cell =>
        cell instanceof Cobweb ||
        cell instanceof Grass ||
        cell instanceof Wood
      ) ? moveY : this.gravitySpeed
    }
    this.entities = entities.filter( (entity) => {
      if (entity.hp > 0) {
        let moveX = (Math.random() - 0.5) / 4
        let moveY = (Math.random() - 0.5) / 4

        if (!this.levelCell( entity.x + moveX, entity.y + moveY )?.some( cell => cell instanceof Barrier )) {
          entity.x += moveX
          entity.y += moveY
        }
      } else {
        if (pythagoras( player.x + 0.5, player.y + 0.5, entity.x, entity.y ) < 1) {
          player.score += 10
          return false
        } else {
          const predicate = cell =>
            cell instanceof Cobweb ||
            cell instanceof Grass ||
            cell instanceof Wood

          if (!this.levelCell( entity.x, entity.y + gravitySpeed - Math.random() )?.some( predicate )) {
            entity.y += gravitySpeed
          }
        }
      }

      return true
    } )
    level.forEach( row => row.length > longestRow && (longestRow = row.length) )

    this.offsetLeft = width / 2 - longestRow * webCellSize / 2
    this.offsetTop = height / 2 - level.length * webCellSize / 2
  }
  draw = () => {
    const {
      ctx,
      offsetLeft,
      offsetTop,
      webCellSize,
      width,
      height,
      mouse,
      maxCobwebWidth,
      player,
      entities,
      viewfinderSize,
    } = this

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

    // Draw entities
    entities.forEach( ({ x, y, size }) => {
      ctx.fillStyle = `black`
      ctx.beginPath()
      ctx.arc( offsetLeft + x * webCellSize, offsetTop + y * webCellSize, size / 2, 0, Math.PI * 2 )
      ctx.fill()
    } )

    // Draw player elements
    const playerOffsetX = offsetLeft + player.x * webCellSize
    const playerOffsetY = offsetTop + player.y * webCellSize
    const webCellSizeBy3 = webCellSize / 3

    if ( mouse.x ) {
      ctx.strokeStyle = pythagoras( playerOffsetX + webCellSize / 2, playerOffsetY + webCellSize / 2, mouse.x, mouse.y ) < maxCobwebWidth
        ? `#0f0a`
        : `#f00a`

      ctx.beginPath()
      ctx.moveTo( playerOffsetX + webCellSize / 2, playerOffsetY + webCellSize / 2 )
      ctx.lineTo( mouse.x, mouse.y )
      ctx.stroke()

      ctx.beginPath()
      ctx.arc( mouse.x, mouse.y, viewfinderSize / 2, 0, Math.PI * 2 )

      if (player.shooting) {
        ctx.strokeStyle = `#fffb`
        ctx.stroke()
      } else {
        ctx.fillStyle = `#fff8`
        ctx.fill()
      }
    }

    ctx.fillStyle = `red`
    ctx.fillRect( playerOffsetX, playerOffsetY, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX + webCellSizeBy3, playerOffsetY + webCellSizeBy3, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX + webCellSizeBy3 * 2, playerOffsetY + webCellSizeBy3 * 2, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX + webCellSizeBy3 * 2, playerOffsetY, webCellSizeBy3, webCellSizeBy3 )
    ctx.fillRect( playerOffsetX, playerOffsetY + webCellSizeBy3 * 2, webCellSizeBy3, webCellSizeBy3 )
  }
  render = () => <canvas ref={this.handleRef} className="game-web" />
}