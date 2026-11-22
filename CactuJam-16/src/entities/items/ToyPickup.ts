import type Game from "../../Game"
import { Sprite } from "../../logic/engine"
import Entity from "../Entity"
import { ITEMS, type ToyKind } from "./items"

/**
 * A toy lying on the ground. The player picks it up by walking over it, unless they have one like it or no room left;
 * then they can swap it for the toy in hand (`Player.swapToy`).
 */
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
    const player = this.game.player
    if (this.isTaken || this.measureGapTo( player ) > 0) return

    if (!player.inventory.canTake( this.kind )) {
      if (!player.inventory.has( this.kind )) this.game.events.emit( `toyOutOfRoom`, { kind:this.kind } )
      return
    }

    this.isTaken = true
    this.game.player.inventory.add( this.kind )
    this.game.events.emit( `toyReceived`, { kind:this.kind } )
  }

  draw( ctx:CanvasRenderingContext2D ) {
    this.drawSprite( ctx, this.sprite )
  }
}
