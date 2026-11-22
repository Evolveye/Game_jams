import playgroundImage from "../assets/slides/playground.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: playgroundImage,
    title: `Wynajęli spadochroniarzy!`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Tym razem każdy przyniósł własną łopatkę. A zza płotu podglądali ich koledzy, czekając na okazję.` },
      { text:`Jedna łopatka mi wystarczy. Ale wam żadnej nie zostawię!`, speaker:PLAYER },
    ],
  },
]

/**
 * Four kids with spades in the sandbox, and four thieves waiting off-screen. Every spade dropped by a beaten kid
 * sends a thief running for it: one hit scares it away, but grabbing the spade it joins the fight.
 * The player cannot take a second spade, so dropped spades stay on the ground for the thieves.
 */
export default new Level( `Wynajęli spadochroniarzy!`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:160, y:60, toys:[ `spade` ], approach:`front` },
    { x:215, y:90, toys:[ `spade` ], approach:`behind` },
    { x:150, y:120, toys:[ `spade` ], approach:`left` },
    { x:200, y:128, toys:[ `spade` ], approach:`right` },
  ])
  level.addLurkingThieves( 4 )

  const allKidsGone = level.waitFor( `allKidsGone` )

  // The first thief comes in: a hint how to deal with them.
  level.waitFor( `kidSpawned`, ({ kid }) => kid.state === `stealing` ).then( () => {
    level.say( `Hej! Zostaw to!` )
    level.note( `Ktoś biegnie po upuszczoną łopatkę! Jeden cios go przepłoszy, ale jeśli ją złapie, dołączy do bójki.` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Same łopatki? To będzie ciekawe.` )

  level.note( `Wejdź do piaskownicy. Nie wyjdziesz z niej, dopóki są w niej inne dzieci.` )
  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Czworo dzieci z łopatkami! Drugiej łopatki nie weźmiesz, więc upuszczone zostaną na ziemi. Uważaj, kto po nie przyjdzie.` )

  await allKidsGone
  await level.say( `Wszystkie łopatki zostają w MOJEJ piaskownicy.` )

  level.note( `Mama woła na obiad. Wyjdź z placu zabaw, żeby wrócić do domu.` )
  await level.callForDinner()
}, STORY )
