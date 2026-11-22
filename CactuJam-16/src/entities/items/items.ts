import bucketIcon from "../../assets/sprites/bucket.png"
import carIcon from "../../assets/sprites/car.png"
import fistIcon from "../../assets/sprites/fist.png"
import mouldsIcon from "../../assets/sprites/moulds.png"
import spadeIcon from "../../assets/sprites/spade.png"
import wateringCanIcon from "../../assets/sprites/watering-can.png"
import { SOUNDS } from "../../logic/sounds"

export type ToyKind = `spade` | `bucket` | `moulds` | `wateringCan` | `car`

/** Everything that can be held: toys, and the bare fist every kid starts with. */
export type ItemKind = `fist` | ToyKind

/** What a hit does to whoever it lands on: health taken, and how hard it pushes. `kind`: the player's item it comes from, if any. */
export type HitStats = { damage:number, knockback:number, kind?:ItemKind }

/**
 * How a swing works. Hits come from the item's pixels, moved in the hand by `arc` and `thrust`;
 * `reach` only tells about it in the inventory; kids measure the real reach from the item's pixels.
 * - `duration`: seconds the swing lasts, `cooldown`: seconds until the next one
 * - `arc`: radians the item turns through, around the aimed direction (0 for a straight jab)
 * - `thrust`: world units the item is pushed out from the hand, and pulled back
 * - `reach`: about how far beyond the body the item gets, in world units
 * - `sound`: played with every swing
 */
export type SwingStats = HitStats & {
  duration: number
  cooldown: number
  arc: number
  thrust: number
  reach: number
  sound?: string
}

/** A toy to ride: selected, it carries the holder at its own `speed` and rams everyone it runs into. */
export type RideStats = { speed:number, ram:HitStats }

/**
 * A toy to throw from (e.g. sand from a bucket): used, it throws a clump that flies in an arc
 * and hits the first target it passes through.
 * - `range`: how far the clump flies at most, in world units; `speed`: how fast, in world units per second
 * - `cooldown`: seconds until the next throw; `sound`: played with every throw
 */
export type ThrowStats = HitStats & { range:number, speed:number, cooldown:number, sound?:string }

/** Water left on the ground: its size in world units, how many seconds it lasts, and the speed multiplier of anyone in it. */
export type PuddleStats = { width:number, height:number, seconds:number, slowdown:number }

/**
 * A toy to pour from (e.g. a watering can): used, it splashes water that hurts a little whoever it hits,
 * and lands as a puddle slowing down everyone who walks through it. The rest as for throwing.
 */
export type WaterStats = HitStats & { range:number, speed:number, cooldown:number, puddle:PuddleStats, sound?:string }

/**
 * What an item is: its name, its icon (on the ground, in hands, swung, ridden, and in the inventory), and its mechanic:
 * - `swing`: used, it is swung in the hand (icons of swung items are drawn pointing down)
 * - `throwing`: used, it throws (e.g. sand)
 * - `watering`: used, it splashes water that leaves a puddle
 * - `ride`: selected, the holder rides it (icons drawn from the side, facing right)
 */
export type ItemDefinition = { name:string, icon:string, swing?:SwingStats, throwing?:ThrowStats, watering?:WaterStats, ride?:RideStats }

/** Bare hands: every kid can swing them, even without a toy. A short jab. */
export const FIST_SWING:SwingStats = { damage:1, knockback:70, duration:0.15, cooldown:0.35, arc:0, thrust:1, reach:4, sound:SOUNDS.swing }

export const ITEMS:Record<ItemKind, ItemDefinition> = {
  fist: { name:`Pięść`, icon:fistIcon, swing:FIST_SWING },
  spade: { name:`Łopatka`, icon:spadeIcon, swing:{ damage:2, knockback:150, duration:0.25, cooldown:0.45, arc:2, thrust:1, reach:8, sound:SOUNDS.swingSpade } },
  bucket: { name:`Wiaderko`, icon:bucketIcon, throwing:{ damage:1, knockback:60, range:70, speed:110, cooldown:1.5, sound:SOUNDS.swing } },
  moulds: { name:`Foremki`, icon:mouldsIcon },
  wateringCan: {
    name: `Konewka`,
    icon: wateringCanIcon,
    watering: { damage:1, knockback:30, range:60, speed:90, cooldown:0.9, puddle:{ width:20, height:10, seconds:10, slowdown:0.3 }, sound:SOUNDS.swing },
  },
  car: { name:`Autko`, icon:carIcon, ride:{ speed:110, ram:{ damage:2, knockback:170 } } },
}

/** Labels of item stats shown in the inventory. */
export const STAT_LABELS = {
  damage: `Siła`,
  reach: `Zasięg`,
  speed: `Prędkość`,
  slowdown: `Spowolnienie`,
}
