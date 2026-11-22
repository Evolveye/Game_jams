import storyImage from "../assets/slides/14-rally.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Rajd po piaskownicy`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Czternastego dnia piaskownica zamieniła się w tor wyścigowy.` },
      { text:`Kierowcy, na start!`, speaker:PLAYER },
    ],
  },
]

/**
 * Two kids driving cars and two throwing sand. Ram against ram for a player who kept the car; the others face
 * steady enemies they cannot push away, and can win a car here. The throwers keep anyone from just driving in circles.
 */
export default new Level( `Rajd po piaskownicy`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:195, y:62, toys:[ `car` ] },
    { x:195, y:118, toys:[ `car` ] },
    { x:232, y:48, toys:[ `bucket` ] },
    { x:232, y:132, toys:[ `bucket` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Dwa autka i kibice z wiaderkami.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Dwóch taranuje autkami, dwóch rzuca piachem. Autka nie cofają się od ciosów, ale twoje autko też taranuje!` )

  await allKidsGone
  await level.say( `Meta! I mamy zwycięzcę.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:55 } )
