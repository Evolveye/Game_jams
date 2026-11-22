import storyImage from "../assets/slides/22-all.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Wszystko naraz`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dwudziestego drugiego dnia przyszli wszyscy, których Sergiusz przegonił. I przyprowadzili czołg.` },
      { text:`Wszyscy naraz? Dawajcie.`, speaker:PLAYER },
    ],
  },
]

/**
 * Everything at once, the day before the finale: the tank (a fat kid driving the car and throwing sand),
 * a fat kid with a spade, three thieves waiting for dropped toys, and a sitting baby kept in. It tests both strength and care.
 */
export default new Level( `Wszystko naraz`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:215, y:90, body:`fat`, toys:[ `car`, `bucket` ] },
    { x:175, y:58, body:`fat`, toys:[ `spade` ], approach:`front` },
  ])
  level.addLurkingThieves( 3 )
  level.placeBaby( 140, 118 )

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Czołg, grubas, złodzieje i bobas. Wszystko naraz.`, { seconds:3 } )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Czołg taranuje i rzuca piachem, grubas z łopatką sięga daleko, a za płotem czekają złodzieje. I nie zapomnij o bobasie!` )

  await allKidsGone
  await level.say( `Czołg rozbity. Ale coś mi mówi, że to jeszcze nie koniec.`, { seconds:3 } )

  await level.callForDinner()
}, { story:STORY } )
