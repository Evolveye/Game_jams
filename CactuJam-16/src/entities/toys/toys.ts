export type ToyKind = `spade` | `bucket` | `moulds` | `wateringCan`

/** How a swing works: reach is measured from the edge of the player's body. */
export type SwingStats = { reach:number, damage:number, knockback:number, cooldown:number, color:string }

/** Used when the player holds no toy that can be swung. */
export const FIST:SwingStats = { reach:3, damage:1, knockback:70, cooldown:0.35, color:`#fcd9b6` }

/** Toys that can be swung like a weapon. */
export const TOY_SWINGS:Partial<Record<ToyKind, SwingStats>> = {
  spade: { reach:9, damage:2, knockback:150, cooldown:0.45, color:`#9ca3af` },
}

/** Placeholder colors of toys lying on the ground. */
export const TOY_COLORS:Record<ToyKind, string> = {
  spade: `#9ca3af`,
  bucket: `#ef4444`,
  moulds: `#22c55e`,
  wateringCan: `#3b82f6`,
}
