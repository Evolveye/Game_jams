import storyImage from "../assets/slides/07-gang.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Złodziejska szajka`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Siódmego dnia za płotem znów czaili się złodzieje. Tym razem cała szajka.` },
      { text:`Niech tylko spróbują coś podnieść.`, speaker:PLAYER },
    ],
  },
]

/**
 * Two kids with buckets and three with spades, and five thieves waiting off-screen, one for every dropped toy.
 * The player already has both kinds, so every dropped toy stays on the ground as bait: a thief grabbing it joins the fight.
 */
export default new Level( `Złodziejska szajka`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:225, y:52, toys:[ `bucket` ] },
    { x:225, y:128, toys:[ `bucket` ] },
    { x:160, y:62, toys:[ `spade` ], approach:`front` },
    { x:165, y:118, toys:[ `spade` ], approach:`behind` },
    { x:195, y:90, toys:[ `spade` ], approach:`left` },
  ])
  level.addLurkingThieves( 5 )

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitFor( `kidSpawned`, ({ kid }) => kid.state === `stealing` ).then( () => {
    level.say( `Łapy precz!` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Zabawki zostają na ziemi. A złodzieje dostaną po łapach.`, { seconds:3 } )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Dwóch rzuca piachem, trzech macha łopatkami, a za płotem czeka pięciu złodziei. Każda upuszczona zabawka to dla nich przynęta.` )

  await allKidsGone
  await level.say( `Szajka rozbita.` )

  await level.callForDinner()
}, { story:STORY } )
