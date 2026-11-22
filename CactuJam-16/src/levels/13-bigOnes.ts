import storyImage from "../assets/slides/13-big.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Grubo`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Trzynastego dnia grubasy przyprowadziły swoich szybkich młodszych braci.` },
      { text:`Duzi i mali. Wszyscy oberwą tak samo.`, speaker:PLAYER },
    ],
  },
]

/**
 * Two fat kids (one with a spade) and three quick kids with fists. Fat kids are not pushed back, so knockback stops
 * helping; the quick ones punish long, slow fights. The spade drops late, from the fat kid holding it.
 */
export default new Level( `Grubo`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:215, y:62, body:`fat`, toys:[ `spade` ] },
    { x:215, y:118, body:`fat` },
    { x:160, y:55, traits:`quick`, approach:`left` },
    { x:160, y:125, traits:`quick`, approach:`right` },
    { x:190, y:90, traits:`quick`, approach:`behind` },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Tych dużych nie odepchnę. Trzeba ich obejść.`, { seconds:3 } )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Grubasy nie cofają się od ciosów, więc odpychanie nic nie da. A szybkie maluchy tylko czekają, aż się zagapisz.` )

  await allKidsGone
  await level.say( `Duzi czy mali, uciekają tak samo.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:60 } )
