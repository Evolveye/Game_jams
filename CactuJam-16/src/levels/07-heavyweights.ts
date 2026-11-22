import playgroundImage from "../assets/slides/playground.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: playgroundImage,
    title: `Ciężka kategoria`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Siódmego dnia przyszedł ktoś większy. A jego kolega przyjechał autkiem.` },
      { text:`Im większy, tym głośniej spada.`, speaker:PLAYER },
    ],
  },
]

/** Test level: a fat kid (slower, with longer reach) and a kid driving the car, ramming the player. */
export default new Level( `Ciężka kategoria`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:200, y:70, body:`fat` },
    { x:210, y:115, toys:[ `car` ] },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Ten duży ma długie łapy. A ten drugi... jeździ?!` )

  level.note( `Wejdź do piaskownicy. Nie wyjdziesz z niej, dopóki są w niej inne dzieci.` )
  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Gruby dzieciak jest wolniejszy, ale sięga dalej. Ten w autku taranuje: uskakuj, gdy rusza!` )

  await allKidsGone
  await level.say( `Ciężka kategoria, lekkie zwycięstwo.` )

  level.note( `Mama woła na obiad. Wyjdź z placu zabaw, żeby wrócić do domu.` )
  await level.callForDinner()
}, STORY )
