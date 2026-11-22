import storyImage from "../assets/slides/12-heavy.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Ciężka kategoria`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dwunastego dnia przyszedł ktoś większy. A jego kolega przyjechał autkiem.` },
      { text:`Im większy, tym głośniej spada.`, speaker:PLAYER },
    ],
  },
]

/**
 * Both steady enemies, one at a time in a quiet sandbox: a fat kid (slower, with longer reach, not pushed back)
 * and a kid driving the car, ramming the player. A beaten driver drops the car: riding it takes a slot.
 */
export default new Level( `Ciężka kategoria`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:200, y:70, body:`fat` },
    { x:210, y:115, toys:[ `car` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitFor( `toyReceived`, ({ kind }) => kind === `car` ).then( () => {
    level.say( `Brum brum!` )
    level.note( `Autko! Wybierz je (`, level.getKeys( `prevToy`, `nextToy` ), `), a pojedziesz nim i będziesz taranować. Zajmuje miejsce na zabawkę.` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Ten duży ma długie łapy. A ten drugi... jeździ?!` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Gruby dzieciak jest wolniejszy, ale sięga dalej. Ten w autku taranuje: uskakuj, gdy rusza!` )

  await allKidsGone
  await level.say( `Ciężka kategoria, lekkie zwycięstwo.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:45 } )
