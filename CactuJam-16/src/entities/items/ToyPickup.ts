import type Game from "../../Game"
import { Sprite } from "../../logic/engine"
import Entity from "../Entity"
import { ITEMS, type ToyKind } from "./items"

/** A toy lying in the sandbox. The player picks it up by walking over it. */
export default class ToyPickup extends Entity {
  kind: ToyKind
  isTaken = false
  sprite: Sprite<`icon`>
  /** Nothing hits a toy; its footprint is where the player picks it up. */
  debugColor = `#facc15`

  constructor( game:Game, kind:ToyKind, x:number, y:number ) {
    super( game, x, y, { width:6, height:4 } )
    this.kind = kind
    this.sprite = new Sprite({ icon:{ src:ITEMS[ kind ].icon } }, `icon` )
  }

  update() {
    if (this.isTaken || this.measureGapTo( this.game.player ) > 0) return

    this.isTaken = true
    this.game.player.inventory.add( this.kind )
    this.game.events.emit( `toyReceived`, { kind:this.kind } )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    this.drawSprite( ctx, this.sprite )
  }
}
