import playgroundImage from "../assets/slides/playground.png"
import Level from "../logic/Level"
import { SOUNDS } from "../logic/sounds"
import { KID } from "../logic/speakers"
import { WORLD } from "../logic/world"
import type { Shot } from "../scenes/SlidesScene"

/** Story before the level. */
const STORY:Shot[] = [
  {
    image: playgroundImage,
    title: `Piaskownica`,
    sound: SOUNDS.storyIntro,
    lines: [
      { text:`Pewnego dnia pewna mama, pewna swego zbyt pewnego siebie synka, udała się z nim na pewien plac zabaw.` },
      { text:`Po dotarciu na miejsce chłopiec od razu zauroczył się zasypaną plażowym piaskiem piaskownicą.` },
    ],
  },
]

/**
 * Tutorial: seven of the easiest, slowest kids play in the sandbox, one of them with a spade.
 * The first punch starts the fight: four kids run away, the rest fight back.
 */
export default new Level( `Piaskownica`, async level => {
  // Setup

  level.placePlayer( -10, 90 )

  const kids = level.spawnKids([
    { x:110, y:60, traits:`slow` },
    { x:150, y:52, traits:`slow` },
    { x:200, y:62, traits:`slow`, toys:[ `spade` ] },
    { x:118, y:100, traits:`slow` },
    { x:168, y:92, traits:`slow` },
    { x:216, y:112, traits:`slow` },
    { x:142, y:124, traits:`slow` },
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

  // The level is played in the sandbox: once in, the player stays until the kids are gone.
  level.confinePlayerOnEntry().then( () => {
    level.note( `Z piaskownicy nie wyjdziesz, dopóki są w niej inne dzieci.` )
  } )



  // Gameplay

  // Coming from the left, stopping on the grass.
  await level.walkPlayerTo( 44, 90 )
  await level.say( `Muszę wykurzyć stąd tych ciućków. Ta piaskownica będzie moja!`, { seconds:3.5 } )

  level.note( `Wejdź do piaskownicy. Jeden z dzieciaków ma łopatkę. Pokonaj go, a ją upuści.` )

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
