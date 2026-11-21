import Level from "../logic/Level"


export default new Level( `Poniedziałek`, async level => {
  level.placePlayer( 60, 196 )
  level.placeToy( `spade`, 104, 124 )
  level.spawnKids([
    { x:124, y:68 },
    { x:196, y:62 },
    { x:156, y:102 },
    { x:212, y:118 },
  ])

  const firstKidFled = level.waitFor( `kidFled` )

  await level.walkPlayerTo( 96, 152 )
  await level.say( `Co?! Ktoś bawi się w MOJEJ piaskownicy?!` )
  await level.say( `Łopatka by się przydała...` )

  level.on( `toyReceived`, () => level.say( `No to teraz pogadamy.` ) )
  await firstKidFled

  const allKidsGone = level.waitFor( `allKidsGone` )

  level.angerKids()
  await level.say( `To MOJA piaskownica!` )
  await allKidsGone

  await level.say( `I niech tak zostanie.` )
  await level.callForDinner()
})
