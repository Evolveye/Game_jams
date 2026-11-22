import storyImage from "../assets/slides/16-crawling.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Raczkujący`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Szesnastego dnia bobas nauczył się raczkować. I raczkował dokładnie tam, gdzie latał piach.` },
      { text:`Celuj, Sergiusz. Celuj.`, speaker:PLAYER },
    ],
  },
]

/**
 * Two kids with buckets and two with fists, and a baby crawling around the sandbox. The player's own sand hits
 * the baby too, so every throw must be aimed, and the no-go zone moves around.
 */
export default new Level( `Raczkujący`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:228, y:50, toys:[ `bucket` ] },
    { x:228, y:130, toys:[ `bucket` ] },
    { x:175, y:62, approach:`front` },
    { x:180, y:118, approach:`behind` },
  ])
  level.placeBaby( 140, 90, { mode:`crawling` } )

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Bobas się rusza. Muszę uważać, gdzie rzucam.`, { seconds:3 } )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Bobas raczkuje po piaskownicy. Twój piach też go trafi, więc celuj ostrożnie, i nie stój przy nim za długo!` )

  await allKidsGone
  await level.say( `Bobas cały, rzucający nie.` )

  await level.callForDinner()
}, { story:STORY } )
