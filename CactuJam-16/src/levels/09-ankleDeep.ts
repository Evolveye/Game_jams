import storyImage from "../assets/slides/09-sprinters.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Kałuża po kostki`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dziewiątego dnia przybiegła cała drużyna sprinterów. Bez kaloszy, za to z kolegą z konewką.` },
      { text:`Zobaczymy, jak pobiegacie w błocie.`, speaker:PLAYER },
    ],
  },
]

/**
 * Six quick kids with fists, and a kid watering the sand around the player; none in rain boots. The puddles slow
 * everyone: the player at first, the sprinters once the player turns the water against them. The waterer drops its can,
 * for a player who did not take one yesterday (at the cost of a slot).
 */
export default new Level( `Kałuża po kostki`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:150, y:58, traits:`quick`, approach:`front` },
    { x:210, y:55, traits:`quick`, approach:`left` },
    { x:232, y:92, traits:`quick`, approach:`behind` },
    { x:205, y:128, traits:`quick`, approach:`right` },
    { x:150, y:124, traits:`quick` },
    { x:185, y:92, traits:`quick`, approach:`behindLeft` },
    { x:232, y:130, toys:[ `wateringCan` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitFor( `toyReceived`, ({ kind }) => kind === `wateringCan` ).then( () => {
    level.say( `Akurat się przyda.` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Szybcy, ale bez kaloszy...` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Sześciu szybkich biegnie prosto na ciebie, a ich kolega leje wodę pod twoje nogi. Nikt tu nie ma kaloszy: kałuże spowalniają też ich.` )
  level.note( `Pokonany chłopak z konewką ją upuści. Rozlej kałuże na drodze sprinterów, a zwolnią.` )

  await allKidsGone
  await level.say( `Kto się nie wysuszył, ten przegrał.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:55 } )
