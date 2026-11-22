import storyImage from "../assets/slides/23-finale.png"
import Level from "../logic/Level"
import { MUSIC, SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Król piaskownicy`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Ostatniego dnia Komitet Obrony Piaskownicy rzucił do walki wszystko, co miał. Nawet dwa autka.` },
      { text:`Wszystko albo nic. Dziś piaskownica będzie moja na zawsze.`, speaker:PLAYER },
    ],
  },
]

/**
 * The final day: two kids driving cars (one pouring from a watering can), a kid throwing sand, a kid with a spade,
 * a sitting and a crawling baby, and five thieves waiting for the dropped toys, two regular and three fat ones.
 * Every toy dropped brings a thief, so the loot must be guarded to the very end.
 */
export default new Level( `Król piaskownicy`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:200, y:58, toys:[ `car` ] },
    { x:200, y:122, toys:[ `car`, `wateringCan` ] },
    { x:232, y:90, toys:[ `bucket` ] },
    { x:165, y:90, toys:[ `spade` ], approach:`front` },
  ])
  level.addLurkingThieves( 2 )
  level.addLurkingThieves( 3, { body:`fat` } )
  level.placeBaby( 130, 60 )
  level.placeBaby( 130, 120, { mode:`crawling` } )

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitFor( `kidSpawned`, ({ kid }) => kid.state === `stealing` ).then( () => {
    level.say( `Nawet o tym nie myśl!` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Dwa autka, dwa bobasy i cała banda za płotem. Ostatni raz.`, { seconds:3 } )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Dwa autka taranują, jedno rozlewa wodę. Jeden rzuca piachem, drugi macha łopatką, a za płotem czeka pięciu złodziei, w tym trzech grubych. Uważaj na bobasy!` )

  await allKidsGone
  await level.say( `Piaskownica jest MOJA. Na zawsze.` )

  await level.callForDinner()
}, { story:STORY, music:MUSIC.tank } )
