import storyImage from "../assets/slides/19-storm.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Burza`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dziewiętnastego dnia rajdowiec zabrał ze sobą konewkę. Za nim szli dwaj grubi kumple w kaloszach.` },
      { text:`Zapowiada się burza.`, speaker:PLAYER },
    ],
  },
]

/**
 * A kid driving the car and pouring from a watering can floods the sandbox while ramming; two fat kids with spades
 * in rain boots walk through the puddles freely, the player does not. Fat kids are slow, but in the puddles
 * the player is slower: the only day they outpace the player, with their long reach and steady bodies.
 */
export default new Level( `Burza`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:215, y:90, toys:[ `car`, `wateringCan` ] },
    { x:160, y:60, body:`fat`, toys:[ `spade` ], approach:`front`, hasRainBoots:true },
    { x:165, y:122, body:`fat`, toys:[ `spade` ], approach:`behind`, hasRainBoots:true },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Jeździ i leje wodę. A grubasy w kaloszach tylko czekają.`, { seconds:3 } )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Autko taranuje i rozlewa wodę po całej piaskownicy. Grubasy w kaloszach chodzą po kałużach bez zwalniania, ty nie: w wodzie będą szybsi od ciebie.` )

  await allKidsGone
  await level.say( `Po burzy zawsze wychodzi słońce.` )

  await level.callForDinner()
}, { story:STORY, parSeconds:70 } )
