import { Sprite } from "../../logic/engine"
import { ITEMS, STAT_LABELS, type ItemKind } from "./items"

/** One held item with its own state: using it puts it on cooldown until it is ready again. */
export default class Item {
  kind: ItemKind
  cooldownTime = 0
  /** The item's icon, drawn in the holder's hand. */
  sprite: Sprite<`icon`>

  constructor( kind:ItemKind ) {
    this.kind = kind
    this.sprite = new Sprite({ icon:{ src:ITEMS[ kind ].icon } }, `icon` )
  }

  get definition() {
    return ITEMS[ this.kind ]
  }

  get isReady() {
    return this.cooldownTime <= 0
  }

  /** Seconds between uses, from the item's mechanic; `null` when it cannot be used (e.g. a ride). */
  get cooldown() {
    const { swing, throwing, watering } = this.definition
    return swing?.cooldown ?? throwing?.cooldown ?? watering?.cooldown ?? null
  }

  /** From 0 (just used) to 1 (ready to use again). */
  get readiness() {
    const cooldown = this.cooldown
    if (!cooldown) return 1

    return 1 - this.cooldownTime / cooldown
  }

  update( seconds:number ) {
    this.cooldownTime = Math.max( 0, this.cooldownTime - seconds )
  }

  /** Starts using the item and puts it on cooldown. Returns its definition, or `null` when it cannot be used or is not ready yet. */
  use() {
    const cooldown = this.cooldown
    if (cooldown === null || !this.isReady) return null

    this.cooldownTime = cooldown
    return this.definition
  }

  /** Stats to show in the inventory: damage, with the reach of a swing or the speed of a ride. */
  getStats() {
    const { swing, throwing, watering, ride } = this.definition

    if (swing) return [ { label:STAT_LABELS.damage, value:swing.damage }, { label:STAT_LABELS.reach, value:swing.reach } ]
    if (throwing) return [ { label:STAT_LABELS.damage, value:throwing.damage }, { label:STAT_LABELS.reach, value:throwing.range } ]
    if (watering) return [ { label:STAT_LABELS.damage, value:watering.damage }, { label:STAT_LABELS.slowdown, value:`${Math.round( (1 - watering.puddle.slowdown) * 100 )}%` } ]
    if (ride) return [ { label:STAT_LABELS.damage, value:ride.ram.damage }, { label:STAT_LABELS.speed, value:ride.speed } ]

    return []
  }
}
