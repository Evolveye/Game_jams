import sandbox from "./01-sandbox"
import allOnOne from "./02-allOnOne"
import fastAndFurious from "./03-fastAndFurious"
import spadeThieves from "./04-spadeThieves"
import sandThrowing from "./05-sandThrowing"
import barrage from "./06-barrage"
import thiefGang from "./07-thiefGang"
import wetWork from "./08-wetWork"
import ankleDeep from "./09-ankleDeep"
import rainBoots from "./10-rainBoots"
import mud from "./11-mud"
import heavyweights from "./12-heavyweights"
import bigOnes from "./13-bigOnes"
import rally from "./14-rally"
import baby from "./15-baby"
import crawling from "./16-crawling"
import obstacleCourse from "./17-obstacleCourse"
import heavyEquipment from "./18-heavyEquipment"
import storm from "./19-storm"
import waves from "./20-waves"
import nursery from "./21-nursery"
import allAtOnce from "./22-allAtOnce"
import sandboxKing from "./23-sandboxKing"

/** An act: days in a row about one theme, by their indexes in `LEVELS`. */
export type Act = { name:string, firstDay:number, lastDay:number }

/** The acts of DESIGN-2.md, with how many days each has, in play order. */
const ACT_LENGTHS = [
  { name:`Pięści`, days:4 },
  { name:`Piasek`, days:3 },
  { name:`Woda`, days:4 },
  { name:`Wagi ciężkie`, days:3 },
  { name:`Bobasy`, days:3 },
  { name:`Mistrzostwo`, days:6 },
]

/** All levels in play order, as in DESIGN-2.md; file names start with their number. */
const LEVELS = [
  sandbox, allOnOne, fastAndFurious, spadeThieves,
  sandThrowing, barrage, thiefGang,
  wetWork, ankleDeep, rainBoots, mud,
  heavyweights, bigOnes, rally,
  baby, crawling, obstacleCourse,
  heavyEquipment, storm, waves, nursery, allAtOnce, sandboxKing,
]

export default LEVELS

/** The acts with the indexes of their first and last days. */
export const ACTS:Act[] = ACT_LENGTHS.map( ({ name }, index) => {
  const firstDay = ACT_LENGTHS.slice( 0, index ).reduce( (sum, act) => sum + act.days, 0 )
  return { name, firstDay, lastDay:firstDay + ACT_LENGTHS[ index ].days - 1 }
} )

/** The act the day (its index in `LEVELS`) belongs to. */
export function findAct( dayIndex:number ) {
  return ACTS.find( act => dayIndex >= act.firstDay && dayIndex <= act.lastDay ) ?? ACTS[ ACTS.length - 1 ]
}
