import playgroundImage from "../assets/slides/playground.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { KID, PLAYER } from "../logic/speakers"
import { SANDBOX, WORLD } from "../logic/world"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the day. */
const STORY:Shot[] = [
  {
    image: playgroundImage,
    title: `Poniedziałek`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Pierwszy dzień wakacji. Słońce, ciepły piasek i jedna myśl: piaskownica.` },
      { text:`To jest MOJA piaskownica. Od zawsze. Każdy na podwórku o tym wie.`, speaker:PLAYER },
      { text:`Wczoraj zostawiłem w niej łopatkę. Dziś idę ją odebrać.`, speaker:PLAYER },
    ],
  },
]


export default new Level( `Poniedziałek`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  const kids = level.spawnKids([
    { x:110, y:60 },
    { x:150, y:52 },
    { x:200, y:62, toys:[ `spade` ] },
    { x:118, y:100 },
    { x:168, y:92 },
    { x:216, y:112 },
    { x:142, y:124 },
  ])
  const spadeKid = kids[ 2 ]

  level.note( level.getKeys( `moveUp`, `moveLeft`, `moveDown`, `moveRight` ), ` — ruch` )
  level.note( level.getKeys( `useToy` ), ` — zamach` )
  level.note( level.getKeys( `switchPace` ), ` — bieg` )
  level.note( level.getKeys( `pause` ), ` — pauza` )

  // Four kids run away: the punched ones (unless defending a toy; one swing can hit several)
  // and the closest ones, scared. The one with the spade always stays to fight.
  const startFight = async () => {
    const runningCount = [ ...level.kids ].filter( kid => kid.state === `fleeing` ).length
    const scaredKids = [ ...level.kids ]
      .filter( kid => kid.state === `playing` && kid !== spadeKid )
      .sort( (a, b) => a.measureGapTo( level.player ) - b.measureGapTo( level.player ) )
      .slice( 0, Math.max( 0, 4 - runningCount ) )

    for (const kid of scaredKids) kid.flee()

    level.angerKids()
    level.note( `Czworo dzieci uciekło, reszta rzuca się na ciebie! Przegoń je wszystkie z piaskownicy.` )
    await level.say( `MAMOOO! On mnie bije!`, { speaker:KID, seconds:1.5 } )
    level.note( `W trakcie bójki biegasz sam, `, level.getKeys( `switchPace` ), ` — chód.` )
    await level.say( `To MOJA piaskownica!` )
  }

  // The first punch starts the fight at once, even in the middle of the intro.
  const fight = level.waitFor( `kidHit` ).then( startFight )
  const allKidsGone = level.waitFor( `allKidsGone` )

  // The day can only end with the spade picked up again. Watched from the start: it can drop any time.
  let hasSpade = false
  const spadePickedUp = level.waitFor( `toyReceived`, ({ kind }) => kind === `spade` ).then( () => {
    hasSpade = true
  } )

  level.on( `toyReceived`, ({ kind }) => {
    if (kind !== `spade`) return

    // After the fight the script has its own line for it.
    if ([ ...level.kids ].some( kid => kid.state === `hostile` )) level.say( `No to teraz pogadamy.` )

    level.note( `Łopatka sięga dalej i odpycha mocniej niż pięść.` )
    level.note( level.getKeys( `prevToy` ), `, `, level.getKeys( `nextToy` ), ` — zmiana przedmiotu` )
  } )

  level.waitUntil( () => level.player.isInside( SANDBOX ) ).then( () => {
    if (!level.kids.size) return

    level.confinePlayer( SANDBOX )
    level.note( `Z piaskownicy nie wyjdziesz, dopóki są w niej inne dzieci.` )
  } )



  // Gameplay

  // Coming from the left, stopping on the grass.
  await level.walkPlayerTo( 44, 90 )
  await level.say( `Co?! Ktoś bawi się w MOJEJ piaskownicy?!` )
  await level.say( `I jeszcze ma moją łopatkę!` )

  level.note( `Jeden z dzieciaków ma łopatkę. Pokonaj go, a ją upuści.` )

  await fight
  await allKidsGone

  level.confinePlayer( WORLD )

  if (!hasSpade) {
    level.note( `Łopatka została w piaskownicy. Bez niej nie wracaj do domu!` )
    await spadePickedUp
    await level.say( `Moja łopatka!` )
  }

  await level.say( `I niech tak zostanie.` )

  level.note( `Mama woła na obiad. Wyjdź z placu zabaw, żeby wrócić do domu.` )
  await level.callForDinner()
}, STORY )
