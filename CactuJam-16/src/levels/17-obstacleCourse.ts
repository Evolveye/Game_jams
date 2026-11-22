import storyImage from "../assets/slides/17-obstacles.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Tor przeszkód`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Siedemnastego dnia w piaskownicy siedziały dwa bobasy. A między nimi jeździł rajdowiec.` },
      { text:`Slalom między bobasami. Co może pójść nie tak?`, speaker:PLAYER },
    ],
  },
]

/**
 * One kid driving the car between two sitting babies. Dodging the car must not end in a baby; the player's own car
 * rams babies as well, so the strongest toy becomes the riskiest.
 */
export default new Level( `Tor przeszkód`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:215, y:90, toys:[ `car` ] },
  ])
  level.placeBaby( 140, 64 )
  level.placeBaby( 170, 118 )

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Uwaga na bobasy. I na autko.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Uskakuj przed autkiem, ale nie wpadnij na bobasy. Twoje autko też je taranuje: jeśli jeździsz, jedź ostrożnie!` )

  await allKidsGone
  await level.say( `Ani jednej łzy.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:40 } )
