import storyImage from "../assets/slides/18-tank.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Ciężki sprzęt`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Osiemnastego dnia przyjechał ktoś naprawdę duży. W autku. Z wiaderkiem piasku.` },
      { text:`To nie dzieciak. To czołg.`, speaker:PLAYER },
    ],
  },
]

/**
 * A human tank: one fat kid with both the car and a bucket. It drives without stopping (steady, ramming hard)
 * and throws sand at the player on the way, from far away.
 */
export default new Level( `Ciężki sprzęt`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:210, y:90, body:`fat`, toys:[ `car`, `bucket` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `To nie dzieciak. To czołg.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Grubas w autku taranuje i po drodze rzuca w ciebie piachem, nawet z daleka. Uskakuj przed autkiem i przed grudkami!` )
  level.note( `Nie cofa się od ciosów i boli bardziej niż inni.` )

  await allKidsGone
  await level.say( `Im większy, tym głośniej spada.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:45, isStuntDay:true } )
