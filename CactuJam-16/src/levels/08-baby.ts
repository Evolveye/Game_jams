import playgroundImage from "../assets/slides/playground.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: playgroundImage,
    title: `Ostrożnie, bobas!`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Ósmego dnia w piaskownicy siedział bobas. A obok niego dwóch największych łobuzów z podwórka.` },
      { text:`Tylko spokojnie. Bobasa nie ruszam.`, speaker:PLAYER },
    ],
  },
]

/** Two fat kids, one with a spade, and a baby sitting in the sandbox: hitting it, or standing next to it too long, loses the day. */
export default new Level( `Ostrożnie, bobas!`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:200, y:65, body:`fat`, toys:[ `spade` ] },
    { x:205, y:120, body:`fat` },
  ])
  level.placeBaby( 150, 92 )

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Bobas w piaskownicy? Muszę uważać.` )

  level.note( `Wejdź do piaskownicy. Nie wyjdziesz z niej, dopóki są w niej inne dzieci.` )
  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `W piaskownicy siedzi bobas. Nie trafiaj go i nie stój przy nim za długo, bo się rozpłacze, a wtedy mama zabierze cię do domu!` )
  level.note( `Grubasy są wolniejsze, ale sięgają dalej. Jeden ma łopatkę.` )

  await allKidsGone
  await level.say( `Bobas cały, piaskownica moja.` )

  level.note( `Mama woła na obiad. Wyjdź z placu zabaw, żeby wrócić do domu.` )
  await level.callForDinner()
}, STORY )
