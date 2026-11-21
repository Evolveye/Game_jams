import Level from "../logic/Level"
import { SANDBOX, WORLD } from "../logic/world"


export default new Level( `Poniedziałek`, async level => {
  level.placePlayer( -10, 90 )
  level.placeToy( `spade`, 104, 124 )
  level.spawnKids([
    { x:124, y:68 },
    { x:196, y:62 },
    { x:156, y:102 },
    { x:212, y:118 },
  ])

  const firstKidFled = level.waitFor( `kidFled` )
  const allKidsGone = level.waitFor( `allKidsGone` )

  // Once in the sandbox, there is no way out until every kid is gone.
  level.waitUntil( () => level.player.isInside( SANDBOX ) ).then( () => {
    if (level.kids.size) level.confinePlayer( SANDBOX )
  } )

  // Coming from the left, stopping on the grass.
  await level.walkPlayerTo( 44, 90 )
  await level.say( `Co?! Ktoś bawi się w MOJEJ piaskownicy?!` )
  await level.say( `Łopatka by się przydała...` )

  level.on( `toyReceived`, () => level.say( `No to teraz pogadamy.` ) )
  await firstKidFled

  level.angerKids()
  await level.say( `To MOJA piaskownica!` )
  await allKidsGone

  level.confinePlayer( WORLD )
  await level.say( `I niech tak zostanie.` )
  await level.callForDinner()
})
