import { ITEMS, STAT_LABELS, type ItemKind } from "./items"

/** One held item with its own state: a swing puts it on cooldown until it is ready again. */
export default class Item {
  kind: ItemKind
  cooldownTime = 0

  constructor( kind:ItemKind ) {
    this.kind = kind
  }

  get definition() {
    return ITEMS[ this.kind ]
  }

  get isReady() {
    return this.cooldownTime <= 0
  }

  /** From 0 (just swung) to 1 (ready to swing again). */
  get readiness() {
    const cooldown = this.definition.swing?.cooldown
    if (!cooldown) return 1

    return 1 - this.cooldownTime / cooldown
  }

  update( seconds:number ) {
    this.cooldownTime = Math.max( 0, this.cooldownTime - seconds )
  }

  /** Starts a swing. Returns its stats, or `null` when the item cannot be swung or is not ready yet. */
  swing() {
    const stats = this.definition.swing
    if (!stats || !this.isReady) return null

    this.cooldownTime = stats.cooldown
    return stats
  }

  /** Stats to show in the inventory. */
  getStats() {
    const stats = this.definition.swing
    if (!stats) return []

    return [
      { label:STAT_LABELS.damage, value:stats.damage },
      { label:STAT_LABELS.reach, value:stats.reach },
    ]
  }
}
