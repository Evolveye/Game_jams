import storyImage from "../assets/slides/10-boots.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Wymoczki`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dziesiątego dnia wszyscy przyszli w kaloszach. Najwyraźniej wiedzieli, co się szykuje.` },
      { text:`Kalosze? Przecież nawet nie pada!`, speaker:PLAYER },
    ],
  },
]

/**
 * Two kids water the sand around the player, three swing spades, three thieves wait off-screen for dropped toys.
 * Every one of them wears rain boots: puddles slow down only the player.
 */
export default new Level( `Wymoczki`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:225, y:55, toys:[ `wateringCan` ], hasRainBoots:true },
    { x:225, y:125, toys:[ `wateringCan` ], hasRainBoots:true },
    { x:160, y:60, toys:[ `spade` ], approach:`front`, hasRainBoots:true },
    { x:180, y:92, toys:[ `spade` ], approach:`behind`, hasRainBoots:true },
    { x:160, y:124, toys:[ `spade` ], approach:`left`, hasRainBoots:true },
  ])
  level.addLurkingThieves( 3, { hasRainBoots:true } )

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Kalosze? Przecież nawet nie pada!` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Wszyscy mają kalosze: kałuże spowalniają tylko ciebie. Omijaj je!` )

  await allKidsGone
  await level.say( `Kalosze kaloszami, a piaskownica moja.` )

  await level.callForDinner()
}, { story:STORY } )
