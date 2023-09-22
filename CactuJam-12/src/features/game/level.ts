import { GameColors, Line, Point, Rect, SemanticColor, SemanticPosition } from "./types"

export type LevelData = (Point | Line | Rect)[][]

export default class Level {
  colors: GameColors

  constructor( colors:GameColors ) {
    this.colors = colors
  }

  getCtxDimensions( ctx:CanvasRenderingContext2D ) {
    return {
      width: ctx.canvas.width,
      height: ctx.canvas.height,
      center: {
        x: ctx.canvas.width / 2,
        y: ctx.canvas.height / 2,
      },
    }
  }
  draw( ctx:CanvasRenderingContext2D ) {
    const { width, height } = this.getCtxDimensions( ctx )
    const getPos = (num:SemanticPosition) => num === `width` ? width : num === `height` ? height : num
    const setColor = (semanticColor:SemanticColor = `land`, type:`fill` | `stroke` = `fill`) => {
      let color = ``

      if (semanticColor === `land`) {
        color = this.colors.safe
      } else if (semanticColor === `land-50`) {
        color = `${this.colors.safe}aa`
      }

      if (type == `fill`) ctx.fillStyle = color
      else if (type == `stroke`) ctx.strokeStyle = color
    }

    ctx.clearRect( 0, 0, width, height )

    levelData.forEach( chunk => chunk.forEach( item => {
      ctx.beginPath()

      if (`from` in item) {
        setColor( item.color, `stroke` )
        ctx.lineWidth = 2
        ctx.moveTo( getPos( item.from.x ), height - getPos( item.from.y ) )
        ctx.lineTo( getPos( item.to.x ), height - getPos( item.to.y ) )
        ctx.stroke()
      } else if (`w` in item) {
        setColor( item.color, `fill` )
        ctx.fillRect( getPos( item.x ), height - getPos( item.y ), getPos( item.w ), getPos( item.h ) )
      } else if (`x` in item) {
        setColor( item.color, `stroke` )
        ctx.arc( getPos( item.x ), height - getPos( item.y ), 5, 0, Math.PI * 2 )
        ctx.fill()
      }
    } ) )
  }
}

const levelData:LevelData = [
  [
    { x:300, y:400 },
    { x:900, y:600 },
  ],
  [
    { color:`land`, from:{ x:0, y:100 }, to:{ x:`width`, y:100 } },
    { color:`land-50`, x:0, y:100, w:`width`, h:100 },
  ],
]
