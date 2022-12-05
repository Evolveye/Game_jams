import Animation from "./Animation"

export default class Sprite {
  framesCount: number
  framesPerRow: number
  framesPerColumn: number
  spreadsheet: HTMLImageElement
  frameWidth: number
  frameheight: number

  constructor( src:string, framesPerRow = 1, framesPerColumn = 1, framesCount = framesPerRow * framesPerColumn ) {
    // if (typeof Image === `undefined`) throw new Error()


    this.framesPerRow = framesPerRow
    this.framesPerColumn = framesPerColumn
    this.framesCount = framesCount

    this.frameWidth = -1
    this.frameheight = -1

    if (typeof Image === `undefined`) {
      this.spreadsheet = null as typeof Image
      return
    }

    this.spreadsheet = new Image()
    this.spreadsheet.src = src
    this.spreadsheet.addEventListener( `load`, () => {
      this.frameWidth = this.spreadsheet.width / this.framesPerRow
      this.frameheight = this.spreadsheet.height / this.framesPerColumn
    } )
  }

  getAnimation = () => {
    return new Animation( this )
  }
}
