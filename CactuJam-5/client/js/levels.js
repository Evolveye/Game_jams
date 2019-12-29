import Game from "./engine.js"

/** @type {Map<String,{ tiles:Any script:Function events:Function }>} */
export default new Map( [
  [ `lab`, {
    tiles: [
      [ `wall-c-90`,`wall-180`           ,`wall-180`,`wall-180`,`wall-180`,`wall-180`,`wall-180`,`wall-180`,`wall-180`        ,`wall-g-180`     ,`wall-t-180`      ,`wall-c-180`   ],
      [ `wall-90`  ,`floor`              ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`           ,[`floor`,`glass`],`floor`           ,`wall-270`     ],
      [ `wall-90`  ,`floor`              ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,[`floor`,`player`],[`floor`,`glass`],[`floor`,`greeny`],`wall-t-270`   ],
      [ `wall-90`  ,[`floor`,`e`,`lever`],`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`           ,[`floor`,`glass`],`floor`           ,`wall-270`     ],
      [ `wall-c`   ,`wall`               ,`wall`    ,`wall`    ,`wall`    ,`wall`    ,`wall`    ,`wall`    ,`wall`            ,`wall-g`         ,`wall-t`          ,`wall-c-270`   ],
    ],
    /** @param {Game} game */
    async script( game ) {},
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
  [ `map1`, {
    tiles: [
      [ `water-c`    ,`water-e-90`           ,`water-e-90`    ,`water-e-90`                       ,`water-e-90`    ,`water-e-90`     ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-c-90`  ],
      [ `water-e`    ,`water`                ,`water`         ,[`water`,'land']                   ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,[`water`,`e`,'land-c2'],[`water`,'land'],[`water`,'land']                   ,`water`         ,[`water`,'land'] ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,[`water`,'land'],`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,[`water`,'land'],`water`                            ,[`water`,'land'],`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,[`water`,'land'],[`water`,'land']                   ,[`water`,'land'],`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,[`water`,'land',`e`,`lab`,`player`],[`water`,'land'],`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-c-270`,`water-e-270`          ,`water-e-270`   ,`water-e-270`                      ,`water-e-270`   ,`water-e-270`    ,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-c-180` ],
    ],
    /** @param {Game} game */
    async script( game ) {},
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
  [ `caves`, {
    tiles: [
      [       ,      ,      ,      ,`cave`,      ,      ,      ,`cave`,      ,       ],
      [ `cave`,`cave`,`cave`,`cave`,`cave`,`cave`,`cave`,`cave`,`cave`,`cave`,`cave` ],
      [       ,`cave`,      ,`cave`,      ,      ,      ,      ,      ,      ,       ],
    ],
    /** @param {Game} game */
    async script( game ) {},
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
  [ `intro`, {
    tiles: [ [ `monster`, `bullet` ] ],
    /** @param {Game} game */
    async script( game ) {
      /** @type {RenderingContext} */
      const ctxB = document.querySelector( `.canvas-helperBgr` ).getContext( `2d` )
      const ctxF = document.querySelector( `.canvas-helperFgr` ).getContext( `2d` )
      const cache = game.storage.userData
      const { map_firstJam, map_secondJam } = cache
      const { width, height } = ctxB.canvas

      const monster = game.level.everyId( `monster` ).next().value.entity
      const bullet = game.level.everyId( `bullet` ).next().value.entity

      const wait = async (seconds) => new Promise( res => setTimeout( () => res(), 1000 * seconds ) )
      const move = async (entity, x, y, i=100) => new Promise( res => {
        entity.translateX += x
        entity.translateY += y

        if (i <= 0) return res()

        i--

        setTimeout( () => move( entity, x, y, i ).then( () => res() ) , 1 )
      } )

      ctxB.imageSmoothingEnabled = false


      // *
      // scene 1
      // Pacman zamienia się w oko bo najadł się prezentów, odlatuje
      // ctxB.drawImage( map_secondJam, width / 2 - 250 / 2, height / 2 - 250 / 2, 250, 250 )

      ctxB.drawImage( map_secondJam, width / 2 - 250 / 2, height / 2 - 250 / 2, 250, 250 )
      monster.translateX = 70
      monster.translateY = 110
      monster.rotateAngle = 200

      await move( monster, -.5, -.14, 500 )

      setTimeout( async () => {
        bullet.translateX = -220
        bullet.translateY = 45
        await move( bullet, 1, .3, 145 )

        await wait( .5 )

        bullet.translateX = -220
        bullet.translateY = 10
        await move( bullet, 1, .1, 200 )

        await wait( .5 )

        bullet.translateX = -200
        bullet.translateY = -40
        await move( bullet, 1, .3, 100 )
      }, 100 )

      monster.rotateAngle = 0

      await wait( .5 )
      await move( monster, .03, -.2, 520 )
      await wait( .5 )

      monster.rotateAngle = 350
      await move( monster, .5, -.1, 1111 )


      // *
      // scene 2
      // przelatuje and wyspami i zacyzna zamrażać

      // ctxB.drawImage( game.storage.userData.map_firstJam, 0, 0, 500, 500 )

      // *
      // scene 3
      // pojawiasz się na mapie, uciekasz jak mario

    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
  [ `map2`, {
    tiles: [
      [ `water-c`    ,`water-e-90`    ,`water-e-90`    ,`water-e-90`    ,`water-e-90`    ,`water-e-90`    ,`water-e-90`    ,`water-e-90`      ,`water-e-90`      ,`water-e-90`      ,`water-e-90`      ,`water-e-90`      ,`water-c-90`  ],
      [ `water-e`    ,`water`         ,`water`         ,`water`         ,[`water`,`land`],[`water`,`land`],`water`         ,`water`           ,`water`           ,`water`           ,`water`           ,`water`           ,`water-e-180` ],
      [ `water-e`    ,`water`         ,`water`         ,[`water`,`land`],[`water`,`land`],[`water`,`land`],[`water`,`land`],`water`           ,`water`           ,`water`           ,`water`           ,`water`           ,`water-e-180` ],
      [ `water-e`    ,`water`         ,`water`         ,[`water`,`land`],`water`         ,`water`         ,[`water`,`land`],[`water`,`land`]  ,[`water`,`desert`],`water`           ,`water`           ,[`water`,`desert`],`water-e-180` ],
      [ `water-e`    ,`water`         ,`water`         ,[`water`,`land`],[`water`,`land`],`water`         ,[`water`,`land`],`water`           ,[`water`,`desert`],[`water`,`desert`],[`water`,`desert`],`water`           ,`water-e-180` ],
      [ `water-e`    ,[`water`,`land`],[`water`,`land`],[`water`,`land`],[`water`,`land`],[`water`,`land`],`water`         ,`water`           ,`water`           ,[`water`,`desert`],[`water`,`desert`],`water`           ,`water-e-180` ],
      [ `water-e`    ,`water`         ,[`water`,`land`],[`water`,`land`],`water`         ,`water`         ,`water`         ,[`water`,`desert`],`water`           ,`water`           ,`water`           ,`water`           ,`water-e-180` ],
      [ `water-c-270`,`water-e-270`   ,`water-e-270`   ,`water-e-270`   ,`water-e-270`   ,`water-e-270`   ,`water-e-270`   ,`water-e-270`     ,`water-e-270`     ,`water-e-270`     ,`water-e-270`     ,`water-e-270`     ,`water-c-180` ],
    ],
    /** @param {Game} game */
    async script( game ) {},
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
  [ `map_empty`, {
    tiles: [
      [ `water-c`    ,`water-e-90`           ,`water-e-90`    ,`water-e-90`                       ,`water-e-90`    ,`water-e-90`     ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-c-90`  ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`         ,`water`          ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-c-270`,`water-e-270`          ,`water-e-270`   ,`water-e-270`                      ,`water-e-270`   ,`water-e-270`    ,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-c-180` ],
    ],
    /** @param {Game} game */
    async script( game ) {},
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
  [ `flying1`, {
    // flying: true,
    gravity: true,
    tiles: [
      [ `cactus` ],
      [],
      [ `player` ],
      [],
      [ `cactus` ],
    ],
    /** @param {Game} game */
    async script( game ) {},
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
] )