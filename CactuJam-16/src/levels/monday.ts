import Level from "../logic/Level"
import { KID } from "../logic/speakers"
import { SANDBOX, WORLD } from "../logic/world"


export default new Level( `Poniedziałek`, async level => {
  // Setup

  level.placePlayer( -10, 90 )
  level.placeToy( `spade`, 104, 124 )
  level.spawnKids([
    { x:124, y:68 },
    { x:196, y:62 },
    { x:156, y:102 },
    { x:212, y:118 },
  ])

  level.note( level.getKeys( `moveUp`, `moveLeft`, `moveDown`, `moveRight` ), ` — ruch` )
  level.note( level.getKeys( `useToy` ), ` — zamach` )
  level.note( level.getKeys( `switchPace` ), ` — bieg` )
  level.note( level.getKeys( `pause` ), ` — pauza` )

  const firstKidFled = level.waitFor( `kidFled` )
  const allKidsGone = level.waitFor( `allKidsGone` )

  level.waitUntil( () => level.player.isInside( SANDBOX ) ).then( () => {
    if (!level.kids.size) return

    level.confinePlayer( SANDBOX )
    level.note( `Z piaskownicy nie wyjdziesz, dopóki są w niej inne dzieci.` )
  } )



  // Gameplay

  // Coming from the left, stopping on the grass.
  await level.walkPlayerTo( 44, 90 )
  await level.say( `Co?! Ktoś bawi się w MOJEJ piaskownicy?!` )
  await level.say( `Łopatka by się przydała...` )

  level.note( `Gdzieś w piaskownicy leży łopatka. Wystarczy po nią przejść.` )
  level.on( `toyReceived`, () => {
    level.say( `No to teraz pogadamy.` )
    level.note( `Łopatka sięga dalej i odpycha mocniej niż pięść.` )
    level.note( level.getKeys( `prevToy` ), `, `, level.getKeys( `nextToy` ), ` — zmiana przedmiotu` )
  } )

  await firstKidFled
  await level.say( `MAMOOO! On mnie bije!`, { speaker:KID, seconds:1.5 } )

  level.angerKids()
  level.note( `Reszta dzieci rzuca się na ciebie! Przegoń je wszystkie z piaskownicy.` )
  level.note( `W trakcie bójki biegasz sam, `, level.getKeys( `switchPace` ), ` — chód.` )
  await level.say( `To MOJA piaskownica!` )
  await allKidsGone

  level.confinePlayer( WORLD )
  await level.say( `I niech tak zostanie.` )

  level.note( `Mama woła na obiad. Wyjdź z placu zabaw, żeby wrócić do domu.` )
  await level.callForDinner()
})
