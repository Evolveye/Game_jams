import storyImage from "../assets/slides/03-fast.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { PLAYER } from "../logic/speakers"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: storyImage,
    title: `Szybcy i wściekli`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Trzeciego dnia do Komitetu dołączyły dzieciaki z klubu małego biegacza.` },
      { text:`Szybcy? Łopatka jest szybsza.`, speaker:PLAYER },
    ],
  },
]

/**
 * Three quick kids and three slow ones, all with fists. The quick ones arrive first and flank the player;
 * the spade's knockback keeps them off while the slow ones catch up.
 */
export default new Level( `Szybcy i wściekli`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  level.spawnKids([
    { x:225, y:55, traits:`quick`, approach:`left` },
    { x:230, y:92, traits:`quick`, approach:`behind` },
    { x:225, y:128, traits:`quick`, approach:`right` },
    { x:145, y:60, traits:`slow` },
    { x:165, y:92, traits:`slow` },
    { x:145, y:124, traits:`slow` },
  ])

  const allKidsGone = level.waitFor( `allKidsGone` )



  // Gameplay

  await level.walkPlayerTo( 44, 90 )
  await level.say( `Ci w dresach są szybcy. Najpierw ich.` )

  await level.confinePlayerOnEntry()

  level.angerKids()
  level.note( `Szybkie dzieciaki dobiegną pierwsze i zajdą cię z boków. Łopatka odpycha najmocniej: trzymaj je na dystans, zanim dojdą wolniejsi.` )

  await allKidsGone
  await level.say( `Za wolno, za wolno.` )

  await level.callForDinner()
}, { story:STORY } )
