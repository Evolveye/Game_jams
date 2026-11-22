import storyImage from "../assets/slides/08-wet.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Mokra robota`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Ósmego dnia ktoś przyniósł konewkę. I wcale nie po to, żeby podlewać kwiatki.` },
      { text:`Błoto? Mnie nic nie zatrzyma.`, speaker:PLAYER },
    ],
  },
]

/**
 * One kid waters the sand around the player: puddles slow down everyone who walks through them, until they dry.
 * Two kids swing spades, two throw sand, and two thieves wait off-screen for the toys dropped by beaten kids.
 */
export default new Level( `Mokra robota`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:220, y:90, toys:[ `wateringCan` ] },
    { x:160, y:60, toys:[ `spade` ], approach:`front` },
    { x:170, y:122, toys:[ `spade` ], approach:`behind` },
    { x:228, y:50, toys:[ `bucket` ], traits:`slow` },
    { x:228, y:130, toys:[ `bucket` ], traits:`quick` },
  ])
  level.addLurkingThieves( 2 )

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitFor( `toyReceived`, ({ kind }) => kind === `wateringCan` ).then( () => {
    level.say( `Teraz wy pochlapiecie się w błocie!` )
    level.note( `Konewka robi kałużę tam, gdzie celujesz: `, level.getKeys( `useToy` ), `. W kałuży wszyscy zwalniają.` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Konewka? Co on kombinuje?` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Dzieciak z konewką robi kałuże wokół ciebie. W kałuży zwalniasz, a reszta tylko na to czeka!` )
  level.note( `Masz miejsce na dwie zabawki. Z pełnymi kieszeniami: `, level.getKeys( `swapToy` ), ` — zamień zabawkę w ręce na tę pod nogami.` )

  await allKidsGone
  await level.say( `Mokro, ale moje.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:60 } )
