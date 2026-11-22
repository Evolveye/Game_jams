import storyImage from "../assets/slides/05-buckets.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Do piachu z wami`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Piątego dnia ktoś przyniósł wiaderka. I wcale nie do budowania babek.` },
      { text:`Jak piaskiem, to piaskiem.`, speaker:PLAYER },
    ],
  },
]

/**
 * Once the player walks into the sandbox, two kids with buckets throw sand from a distance, one slower, one faster.
 * Three more circle around to attack from behind. A beaten thrower drops its bucket, for the player to throw back.
 */
export default new Level( `Do piachu z wami`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:225, y:52, toys:[ `bucket` ], traits:`slow` },
    { x:228, y:128, toys:[ `bucket` ], traits:`quick` },
    { x:150, y:70, approach:`behind` },
    { x:165, y:115, approach:`behindLeft` },
    { x:195, y:92, approach:`behindRight` },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitFor( `toyReceived`, ({ kind }) => kind === `bucket` ).then( () => {
    level.say( `Teraz moja kolej!` )
    level.note( `Wiaderko rzuca piachem: `, level.getKeys( `useToy` ), ` — tam, gdzie celujesz myszką, albo prosto przed siebie.` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Piaskiem? Serio?!` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Dwóch rzuca piachem z daleka. Uskakuj przed lecącymi grudkami i dopadnij ich!` )
  level.note( `Pokonany rzucający upuści wiaderko. Podnieś je i odpłać się tym samym.` )

  await allKidsGone
  await level.say( `Piasek zostaje w piaskownicy.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:50 } )
