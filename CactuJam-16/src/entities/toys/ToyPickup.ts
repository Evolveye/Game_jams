import type Game from "../../Game"
import Entity from "../Entity"
import { TOY_COLORS, type ToyKind } from "./toys"

/** A toy lying in the sandbox. The player picks it up by walking over it. */
export default class ToyPickup extends Entity {
  kind: ToyKind
  isTaken = false

  constructor( game:Game, kind:ToyKind, x:number, y:number ) {
    super( game, x, y, 3 )
    this.kind = kind
  }

  update() {
    if (this.isTaken || this.measureGapTo( this.game.player ) > 0) return

    this.isTaken = true
    this.game.player.addToy( this.kind )
    this.game.events.emit( `toyReceived`, { kind:this.kind } )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    this.drawBody( ctx, TOY_COLORS[ this.kind ] )
  }
}
