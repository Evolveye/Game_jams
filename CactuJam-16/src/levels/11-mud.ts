import storyImage from "../assets/slides/11-mud.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Błoto`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Jedenastego dnia dzieciaki zrobiły z piaskownicy bagno. Ci w kaloszach lali wodę, reszta rzucała piachem.` },
      { text:`Błoto i piach. Pięknie.`, speaker:PLAYER },
    ],
  },
]

/**
 * Two kids in rain boots water the sand around the player, two without boots throw sand: the puddles pin the player
 * inside the throw lines. The way out: break free, or flood the throwers, who have no boots.
 */
export default new Level( `Błoto`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:205, y:60, toys:[ `wateringCan` ], hasRainBoots:true },
    { x:205, y:120, toys:[ `wateringCan` ], hasRainBoots:true },
    { x:232, y:48, toys:[ `bucket` ] },
    { x:232, y:132, toys:[ `bucket` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Jedni mnie zatopią, drudzy obrzucą.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Kałuże trzymają cię w miejscu, a rzucający tylko na to czekają. Wyrwij się z błota albo zalej rzucających: oni nie mają kaloszy.` )

  await allKidsGone
  await level.say( `Wyszedłem z tego suchą stopą. Prawie.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:55 } )
