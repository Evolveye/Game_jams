export type ToyKind = `spade` | `bucket` | `moulds` | `wateringCan`

/** Everything that can be held: toys, and the bare fist every kid starts with. */
export type ItemKind = `fist` | ToyKind

/** How a swing works: reach is measured from the edge of the holder's body. */
export type SwingStats = { reach:number, damage:number, knockback:number, cooldown:number }

/** What an item is: its name and placeholder color, and how it swings if it can be swung. */
export type ItemDefinition = { name:string, color:string, swing?:SwingStats }

/** Bare hands: every kid can swing them, even without a toy. */
export const FIST_SWING:SwingStats = { reach:3, damage:1, knockback:70, cooldown:0.35 }

export const ITEMS:Record<ItemKind, ItemDefinition> = {
  fist: { name:`Pięść`, color:`#fcd9b6`, swing:FIST_SWING },
  spade: { name:`Łopatka`, color:`#9ca3af`, swing:{ reach:9, damage:2, knockback:150, cooldown:0.45 } },
  bucket: { name:`Wiaderko`, color:`#ef4444` },
  moulds: { name:`Foremki`, color:`#22c55e` },
  wateringCan: { name:`Konewka`, color:`#3b82f6` },
}

/** Labels of item stats shown in the inventory. */
export const STAT_LABELS = {
  damage: `Siła`,
  reach: `Zasięg`,
}
