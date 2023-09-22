import Game from "./controller"

export default class CactuJam12Game extends Game {
  constructor( div:HTMLDivElement ) {
    super( div )
  }

  draw(): void {
    throw new Error( `Method not implemented.` )
  }
  logic(): void {
    throw new Error( `Method not implemented.` )
  }
}
