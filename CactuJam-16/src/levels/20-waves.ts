import storyImage from "../assets/slides/20-waves.png"
import Level from "../logic/Level"
import { MUSIC, SOUNDS } from "../logic/sounds"
import { KID, PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Fale`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Dwudziestego dnia dzieciaki przyszły na zmiany. Jedni walczyli, a drudzy czekali za płotem na swoją kolej.` },
      { text:`Ilu was jeszcze jest?`, speaker:PLAYER },
    ],
  },
]

/**
 * An endurance check in three waves, each running in from outside once the previous one is gone:
 * fists, then throwers with a watering can, then a fat kid and a kid driving the car.
 * Each wave favours different toys, so the player swaps mid-day and lives with the choice afterwards.
 * Thieves guard the loot from both later waves: two wait off-screen for the second wave's drops, a third joins them
 * before the third wave.
 */
export default new Level( `Fale`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:160, y:58, approach:`front` },
    { x:220, y:70, approach:`behind` },
    { x:215, y:118, approach:`left` },
    { x:160, y:124, approach:`right` },
  ])
  level.addLurkingThieves( 2 )

  level.waitFor( `kidSpawned`, ({ kid }) => kid.state === `stealing` ).then( () => {
    level.say( `To moje łupy!` )
  } )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Czterech? To tylko rozgrzewka.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Pierwsza fala: czterech na pięści. Oszczędzaj siły, za płotem czekają następni.` )
  await level.waitFor( `allKidsGone` )

  // Second wave: throwers and a watering can.
  await level.say( `Następni!`, { speaker:KID, seconds:1.5 } )
  level.spawnKidsFromEdge([
    { x:225, y:50, toys:[ `bucket` ] },
    { x:225, y:130, toys:[ `bucket` ] },
    { x:100, y:50, toys:[ `bucket` ] },
    { x:200, y:90, toys:[ `wateringCan` ] },
  ])
  level.note( `Druga fala: trzech z wiaderkami i jeden z konewką. Pokonani zostawią zabawki, możesz się przezbroić, ale za płotem czekają złodzieje.` )
  await level.waitFor( `allKidsGone` )

  // Third wave: the heavy ones, and one more thief waiting for their drops.
  await level.say( `To jeszcze nie koniec!`, { speaker:KID, seconds:1.5 } )
  level.spawnKidsFromEdge([
    { x:210, y:65, body:`fat` },
    { x:200, y:118, toys:[ `car` ] },
  ])
  level.addLurkingThieves( 1 )
  level.note( `Ostatnia fala: grubas i autko. Żaden z nich nie cofa się od ciosów, a za płotem czeka jeszcze jeden złodziej.` )
  await level.waitFor( `allKidsGone` )

  await level.say( `Ilu was jeszcze jest? Nikogo? Tak myślałem.`, { seconds:3 } )

  await level.callForDinner()
}, { story:STORY, music:MUSIC.tank } )
