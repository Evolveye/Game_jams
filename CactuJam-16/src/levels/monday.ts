import Level from "../logic/Level"

export default new Level( `Poniedziałek`, async level => {
  await level.say( `Mama kupiła mi łopatkę!` )
  level.giveToy( `spade` )

  await level.wait( 5 )

  level.spawn([ `grabber`, `grabber` ])
  await level.waitFor( `allEnemiesGone` )

  await level.say( `To MOJA piaskownica!` )
  level.spawn([ `grabber`, `grabber`, `grabber` ])

  await Promise.race([ level.wait( 30 ), level.waitFor( `allEnemiesGone` ) ])
  await level.callForDinner()
})
