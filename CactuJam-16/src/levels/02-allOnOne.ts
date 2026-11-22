import playgroundImage from "../assets/slides/playground.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: playgroundImage,
    title: `Wszyscy na jednego`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Następnego dnia przegonione dzieciaki wróciły. I to nie same.` },
      { text:`Wszyscy na jednego? Phi. Piaskownica i tak jest moja.`, speaker:PLAYER },
    ],
  },
]

/**
 * All seven kids are in the sandbox and attack once the player walks in: from every side, each circling
 * to its own spot around the player, and touching them hurts. Two have spades: one in front, one behind.
 */
export default new Level( `Wszyscy na jednego`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:150, y:90, toys:[ `spade` ], approach:`front` },
    { x:225, y:60, toys:[ `spade` ], approach:`behind` },
    { x:130, y:128, approach:`left` },
    { x:200, y:126, approach:`right` },
    { x:170, y:52, approach:`frontLeft` },
    { x:228, y:108, approach:`behindRight` },
    { x:190, y:88 },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Wszyscy na jednego? No to zapraszam!` )

  level.note( `Wejdź do piaskownicy. Nie wyjdziesz z niej, dopóki są w niej inne dzieci.` )
  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Dzieciaki atakują ze wszystkich stron. Samo dotknięcie któregoś też boli, nie daj się otoczyć!` )
  level.note( `Dwóch ma łopatki: jeden idzie od przodu, drugi zachodzi od tyłu.` )

  await allKidsGone
  await level.say( `I kto tu rządzi?` )

  level.note( `Mama woła na obiad. Wyjdź z placu zabaw, żeby wrócić do domu.` )
  await level.callForDinner()
}, STORY )
