import bucketIcon from "../../assets/sprites/bucket.png"
import fistIcon from "../../assets/sprites/fist.png"
import mouldsIcon from "../../assets/sprites/moulds.png"
import spadeIcon from "../../assets/sprites/spade.png"
import wateringCanIcon from "../../assets/sprites/watering-can.png"
import { SOUNDS } from "../../logic/sounds"

export type ToyKind = `spade` | `bucket` | `moulds` | `wateringCan`

/** Everything that can be held: toys, and the bare fist every kid starts with. */
export type ItemKind = `fist` | ToyKind

/**
 * How a swing works. Hits come from the item's pixels, moved in the hand by `arc` and `thrust`;
 * `reach` only tells about it: shown in the inventory, and how close kids walk before swinging.
 * - `duration`: seconds the swing lasts, `cooldown`: seconds until the next one
 * - `arc`: radians the item turns through, around the aimed direction (0 for a straight jab)
 * - `thrust`: world units the item is pushed out from the hand, and pulled back
 * - `reach`: about how far beyond the body the item gets, in world units
 * - `sound`: played with every swing
 */
export type SwingStats = {
  damage: number
  knockback: number
  duration: number
  cooldown: number
  arc: number
  thrust: number
  reach: number
  sound?: string
}

/**
 * What an item is: its name, its icon (on the ground, in hands, swung, and in the inventory; drawn pointing down),
 * and how it swings if it can be swung.
 */
export type ItemDefinition = { name:string, icon:string, swing?:SwingStats }

/** Bare hands: every kid can swing them, even without a toy. A short jab. */
export const FIST_SWING:SwingStats = { damage:1, knockback:70, duration:0.15, cooldown:0.35, arc:0, thrust:1, reach:4, sound:SOUNDS.swing }

export const ITEMS:Record<ItemKind, ItemDefinition> = {
  fist: { name:`Pięść`, icon:fistIcon, swing:FIST_SWING },
  spade: { name:`Łopatka`, icon:spadeIcon, swing:{ damage:2, knockback:150, duration:0.25, cooldown:0.45, arc:2, thrust:1, reach:8, sound:SOUNDS.swingSpade } },
  bucket: { name:`Wiaderko`, icon:bucketIcon },
  moulds: { name:`Foremki`, icon:mouldsIcon },
  wateringCan: { name:`Konewka`, icon:wateringCanIcon },
}

/** Labels of item stats shown in the inventory. */
export const STAT_LABELS = {
  damage: `Siła`,
  reach: `Zasięg`,
}
