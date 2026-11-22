import storyImage from "../assets/slides/06-barrage.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Ogień zaporowy`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Szóstego dnia nikt już nie chciał podchodzić do Sergiusza. Woleli rzucać z daleka.` },
      { text:`Tchórze. Ale celni tchórze.`, speaker:PLAYER },
    ],
  },
]

/** Four kids with buckets, one in each corner of the sandbox: nobody comes close, sand flies from every side. */
export default new Level( `Ogień zaporowy`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:92, y:48, toys:[ `bucket` ] },
    { x:228, y:48, toys:[ `bucket` ] },
    { x:92, y:132, toys:[ `bucket` ] },
    { x:228, y:132, toys:[ `bucket` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Z każdego rogu? Sprytne.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Czterech rzuca piachem z czterech rogów i nikt nie podejdzie. Dopadaj ich po kolei i uskakuj przed grudkami.` )
  level.note( `Pokonany rzucający upuści wiaderko, jeśli jeszcze go nie masz.` )

  await allKidsGone
  await level.say( `Koniec piaskowej burzy.` )

  await level.callForDinner()
}, { story:STORY } )
