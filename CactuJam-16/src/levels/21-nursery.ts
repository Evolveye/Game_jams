import storyImage from "../assets/slides/21-nursery.png"
import Level from "../logic/Level"
import { MUSIC, SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Żłobek`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dwudziestego pierwszego dnia ktoś zostawił w piaskownicy cały żłobek.` },
      { text:`Cztery bobasy, sześciu łobuzów. Spokojnie...`, speaker:PLAYER },
    ],
  },
]

/**
 * The hardest precision test: four quick kids with fists and two throwers drag the fight around four crawling babies,
 * three of which crawl after the player, always underfoot.
 */
export default new Level( `Żłobek`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:160, y:55, traits:`quick`, approach:`front` },
    { x:160, y:125, traits:`quick`, approach:`behind` },
    { x:205, y:62, traits:`quick`, approach:`left` },
    { x:205, y:118, traits:`quick`, approach:`right` },
    { x:232, y:48, toys:[ `bucket` ] },
    { x:232, y:132, toys:[ `bucket` ] },
  ])
  level.placeBaby( 125, 70, { mode:`following` } )
  level.placeBaby( 130, 115, { mode:`following` } )
  level.placeBaby( 185, 92, { mode:`crawling` } )
  level.placeBaby( 225, 90, { mode:`following` } )

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Tylko nie płaczcie. Proszę.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Cztery bobasy raczkują po piaskownicy, a trzy z nich ciągle za tobą. Szybkie dzieciaki ciągną bójkę, więc patrz pod nogi i celuj ostrożnie!` )

  await allKidsGone
  await level.say( `Żłobek zamknięty. Bez jednej łzy.` )

  await level.callForDinner()
}, { story:STORY, music:MUSIC.tiptoe } )
