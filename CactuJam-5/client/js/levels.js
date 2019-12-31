import Game from "./engine.js"

/** @type {Map<String,{ tiles:Any script:Function events:Function }>} */
export default new Map( [
  [ `lab`, {
    tiles: [
      [ `wall-c-90`,`wall-180`           ,`wall-180`,`wall-180`,`wall-180`,`wall-180`,`wall-180`,`wall-180`,`wall-180`          ,`wall-g-180`     ,`wall-t-180`      ,`wall-c-180`   ],
      [ `wall-90`  ,`floor`              ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,[`floor`,`profesor`],[`floor`,`glass`],`floor`           ,`wall-270`     ],
      [ `wall-90`  ,`floor`              ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,[`floor`,`player`]  ,[`floor`,`glass`],[`floor`,`greeny`],`wall-t-270`   ],
      [ `wall-90`  ,[`floor`,`e`,`lever`],`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`   ,`floor`             ,[`floor`,`glass`],`floor`           ,`wall-270`     ],
      [ `wall-c`   ,`wall`               ,`wall`    ,`wall`    ,`wall`    ,`wall`    ,`wall`    ,`wall`    ,`wall`              ,`wall-g`         ,`wall-t`          ,`wall-c-270`   ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData


      if ( !data.lab_run ) data.lab_run = 1

      if ( data.lab_run == 1 ) {
        data.wav_lab.play()
        data.lab_run = 1
        game.moving = false
        await game.wait( 1 )
        await game.createDialog( `Pozostaje nam już tylko czyn godny Kronka. Ciąg za wajchę!`, `profesor` )
        game.moving = true
      }
      else if ( data.lab_run == 2 ) {
        data.wav_lab.play()
        game.moving = false
        await game.createDialog( `Pora na kolejną próbę. Wiesz co robić.`, `profesor` )
        game.moving = true
      }
      else if ( data.lab_run == 3 ) {
        await game.wait( 1.5 )
        await game.createDialog( `Nie jest dobrze!`, `profesor` )
        await game.createDialog( `Jakieś latające zamrażajace monstrum opuściło naszą śmieciową wyspę.`, `profesor` )
        await game.createDialog( `Udaj się do <s>Gulguldryka Gryfindyka</s> Ranfinarium. Tam powinni być w stanie zaradzić - w końcu żyją na pustyniach.`, `profesor` )

        data.map1_run = 3
        game.buildLevel( `map1` )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    async events( eventInOrder, game ) {
      const data = game.storage.userData

      if ( data.lab_run == 1 ) {
        data.lab_run = 0
        game.level.setEntity( `pacman`, 10, 2, 1 )

        await game.wait( 2 )
        await game.createDialog( `um...`, `player` )
        await game.createDialog( `Znowu coś nie wyszło ale tym razem nasz twór żyje.`, `player` )
        await game.createDialog( `Cóż. Powinien przeżyć na naszym wysypisku, wywieź go.`, `player` )
        await game.wait( 2 )

        data.map1_run = 1
        game.level.setEntity( `greeny`, 10, 2, 1 )
        game.buildLevel( `map1` )
      }
      else if ( data.lab_run == 2 ) {
        data.lab_run = 0
        game.level.setEntity( `gifts`, 10, 2, 1 )

        await game.wait( 2 )
        await game.createDialog( `mmm...`, `player` )
        await game.createDialog( `To dalej nie to co być powinno ale wyglada interesująco.`, `player` )
        await game.createDialog( `Fakt faktem nie chcę tego próbować, ale zostawimy sobie jedno w laboratorium. Resztę możesz wyrzucić.`, `player` )
        await game.wait( 2 )

        data.map1_run = 2
        game.level.setEntity( `greeny`, 10, 2, 1 )
        game.buildLevel( `map1` )
      }
    }
  } ],
  [ `map1`, {
    tiles: [
      [ `water-c`    ,`water-e-90`           ,`water-e-90`    ,`water-e-90`                       ,`water-e-90`                 ,`water-e-90`                 ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-c-90`  ],
      [ `water-e`    ,`water`                ,`water`         ,[`water`,'land']                   ,[`water`,'land',`e`,`heli-b`],`water`                      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,[`water`,`e`,'land-c2'],[`water`,'land'],[`water`,'land']                   ,[`water`,'land']             ,[`water`,'land',`e`,`heli-b`],`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,[`water`,'land'],[`water`,'land']                   ,`water`                      ,`water`                      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,[`water`,'land'],`water`                            ,[`water`,'land']             ,`water`                      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,[`water`,'land'],[`water`,'land']                   ,[`water`,'land']             ,`water`                      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,[`water`,'land',`e`,`lab`,`player`],[`water`,'land']             ,`water`                      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                ,`water`         ,`water`                            ,`water`                      ,`water`                      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-c-270`,`water-e-270`          ,`water-e-270`   ,`water-e-270`                      ,`water-e-270`                ,`water-e-270`                ,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-e-270`,`water-c-180` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData

      data.wav_map.play()

      const setSnow = () => {
        game.level.setEntity( `snow`, 1, 2 )
        game.level.setEntity( `snow`, 2, 2 )
        game.level.setEntity( `snow`, 3, 2 )
        game.level.setEntity( `snow`, 3, 1 )
        game.level.setEntity( `snow`, 4, 2 )
      }

      let monster

      if ( !data.map1_run ) data.map1_run = 1

      if ( data.map1_run == 1 ) {
        game.level.setEntity( `land-c1`, 1, 2, 2 )
        game.inventory( `set`, `pacman`, 1 )
      }
      else if ( data.map1_run == 2 ) {
        game.level.setEntity( `land-c2`, 1, 2, 2 )
        game.inventory( `set`, `gifts`, 1 )
      }
      else if ( data.map1_run == 3 ) {
        setSnow()

        game.level.setEntity( `monster`, 3, 7 )
        const monster = game.level.everyId( `monster` ).next().value.entity
        monster.translateX = 25
        monster.translateY = -325
      }
      else if ( data.map1_run == 4 ) {
        setSnow()

        game.level.setEntity( `monster`, 3, 7 )
        monster = game.level.everyId( `monster` ).next().value

        if ( !monster ) {
          game.level.setEntity( `monster`, 3, 7 )
          monster = game.level.everyId( `monster` ).next().value
        }

        monster = monster.entity
        monster.translateX = 25
        monster.translateY = -325

        game.level.move( 3, 6, 4, 4, 1 )
        game.createDialog( `Oj, tędy nie przelecę na pewno. Muszę przelecieć przez`, `player` )
      }
      else if ( data.map1_run == 5 ) {
        setSnow()

        monster = game.level.everyId( `monster` ).next().value

        if ( !monster ) {
          game.level.setEntity( `monster`, 3, 7 )
          monster = game.level.everyId( `monster` ).next().value
        }

        monster = monster.entity
        monster.translateX = 25
        monster.translateY = -325

        game.level.move( 3, 6, 4, 4, 1 )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    async events( eventInOrder, game ) {
      const data = game.storage.userData

      if ( data.map1_run == 1 ) {
        if ( eventInOrder == 0 || eventInOrder == 2 ) {
          if ( !data.map_lastFlying || Date.now() - data.map_lastFlying < 5 * 10000 ){
            game.createDialog( `Nie, nie. Nigdzie lecieć nie muszę`, `player` )
            data.map_lastFlying = Date.now()
          }
        }
        else if ( eventInOrder == 1 ) game.inventory( `remove`, `pacman`, 1, true )
        else if ( eventInOrder == 3 ) {
          const pacmans = game.inventory( `get`, `pacman` )

          if ( pacmans.count != 0 ) {} // ####
          else {
            data.lab_run = 2
            game.buildLevel( `lab` )
          }
        }
      }
      else if ( data.map1_run == 2 ) {
        if ( eventInOrder == 0 || eventInOrder == 2 ) {
          if ( !data.map_lastFlying || Date.now() - data.map_lastFlying > 3 * 10000 ){
            game.createDialog( `Nie, nie. Nigdzie lecieć nie muszę`, `player` )
            data.map_lastFlying = Date.now()
          }
        }
        else if ( eventInOrder == 1 ) game.inventory( `remove`, `gifts`, 1, true )
        else if ( eventInOrder == 3 ) {
          const gifts = game.inventory( `get`, `gifts` )

          if ( gifts.count != 0 ) {} // ####
          else {
            data.intro_run = 1
            game.buildLevel( `intro` )
          }
        }
      }
      else if ( data.map1_run == 3 ) {
        if ( eventInOrder == 1 ) {
          if ( !data.map_lastCactuLand || Date.now() - data.map_lastCactuLand > 10 * 10000 ) {
            game.createDialog( `Nie ma czasu na chowanie się w śmieciach. Musze ruszac do Ranfinarium.`, `player` )
            data.map_lastCactuLand = Date.now()
          }
        }
        else if ( eventInOrder == 2 ) {
          if ( !data.map_lastHeli || Date.now() - data.map_lastHeli > 10 * 10000 ) {
            game.createDialog( `Wait, to nie to lądowisko.`, `player` )
            data.map_lastHeli = Date.now()
          }
        }
        else if ( eventInOrder == 0 ) {
          data.fight_run = 1
          game.buildLevel( `fight` )
        }
      }
      else if ( data.map1_run == 4 ) {
        if ( eventInOrder != 2 ) {
          if ( !data.map_afterFirstFight || Date.now() - data.map_afterFirstFight > 10 * 1000 ) {
            game.createDialog( `nie ma na to czasu :|.`, `player` )
            data.map_afterFirstFight = Date.now()
          }
        }
        else {
          data.flyingFrom = `map1`
          data.flyingTo = `map2`
          data.flyingToStage = 1
          game.buildLevel( `flying1` )
        }
      }
      else if ( data.map1_run == 5 ) {
        if ( eventInOrder == 3 ) {
          data.wav_map.pause()

          const { ctxF } = game
          const { width, height } = ctxF.canvas

          ctxF.fillStyle = `#000`
          ctxF.fillRect( 0, 0, width, height )

          await game.wait( 3 )
          await game.createDialog( `Oh, dzięki Bogu!`, `profesor` )
          await game.wait( 1 )
          await game.createDialog( `...`, `e` )
          await game.wait( 1 )
          await game.createDialog( `...`, `e` )
          await game.createDialog( `Odpalamy?!`, `profesor` )
          await game.wait( 2 )

          game.end( `over`, `lab`, 5 )
        }
      }
    }
  } ],
  [ `map2`, {
    tiles: [
      [ `water-c`    ,`water-e-90`                 ,`water-e-90`    ,`water-e-90`    ,`water-e-90`                 ,`water-e-90`                       ,`water-e-90`    ,`water-e-90`      ,`water-e-90`      ,`water-e-90`      ,`water-e-90`      ,`water-e-90`      ,`water-c-90`  ],
      [ `water-e`    ,`water`                      ,`water`         ,`water`         ,[`water`,`land`,`e`,`heli-b`],[`water`,`land`]                   ,`water`         ,`water`           ,`water`           ,`water`           ,`water`           ,`water`           ,`water-e-180` ],
      [ `water-e`    ,`water`                      ,`water`         ,[`water`,`land`],[`water`,`land`]             ,[`water`,`land`]                   ,[`water`,`land`],`water`           ,`water`           ,`water`           ,`water`           ,`water`           ,`water-e-180` ],
      [ `water-e`    ,`water`                      ,`water`         ,[`water`,`land`],`water`                      ,`water`                            ,[`water`,`land`],[`water`,`land`]  ,[`water`,`desert`],`water`           ,`water`           ,[`water`,`desert`],`water-e-180` ],
      [ `water-e`    ,`water`                      ,`water`         ,[`water`,`land`],[`water`,`land`]             ,`water`                            ,[`water`,`land`],`water`           ,[`water`,`desert`],[`water`,`desert`],[`water`,`desert`],`water`           ,`water-e-180` ],
      [ `water-e`    ,[`water`,`land`,`e`,`heli-b`],[`water`,`land`],[`water`,`land`],[`water`,`land`]             ,[`water`,`land`,`e`,`lab`,`player`],`water`         ,`water`           ,`water`           ,[`water`,`desert`],[`water`,`desert`],`water`           ,`water-e-180` ],
      [ `water-e`    ,`water`                      ,[`water`,`land`],[`water`,`land`],`water`                      ,`water`                            ,`water`         ,[`water`,`desert`],`water`           ,`water`           ,`water`           ,`water`           ,`water-e-180` ],
      [ `water-c-270`,`water-e-270`                ,`water-e-270`   ,`water-e-270`   ,`water-e-270`                ,`water-e-270`                      ,`water-e-270`   ,`water-e-270`     ,`water-e-270`     ,`water-e-270`     ,`water-e-270`     ,`water-e-270`     ,`water-c-180` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const { level } = game
      const heliBGenerator = level.everyId( `heli-b` )
      const heliToRanfisarium = heliBGenerator.next().value.entity
      const heliToStart = heliBGenerator.next().value.entity

      data.wav_map.play()

      if ( !data.map2_run ) data.map2_run = 1

      if ( data.map2_run == 1 ) {
        game.level.move( 5, 5, 4, heliToStart.tileX, heliToStart.tileY )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      const data = game.storage.userData

      if ( data.map2_run == 1 ) {
        if ( eventInOrder == 0 ) {
          data.flyingFrom = `map2`
          data.flyingTo = `map3`
          data.flyingToStage = 1
          game.buildLevel( `flying2` )
        }
      }
    }
  } ],
  [ `map3`, {
    tiles: [
      [ `water-c`    ,`water-e-90`                     ,`water-e-90` ,`water-e-90`             ,`water-e-90`                   ,`water-e-90`                   ,`water-e-90`      ,`water-e-90`      ,`water-e-90`                         ,`water-e-90` ,`water-e-90` ,`water-e-90` ,`water-c-90`  ],
      [ `water-e`    ,`water`                          ,`water`      ,`water`                  ,`water`                        ,[`water`,`desert`]             ,[`water`,`desert`],`water`           ,`water`                              ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                          ,`water`      ,`water`                  ,[`water`,`desert`]             ,[`water`,`desert`]             ,[`water`,`desert`],[`water`,`desert`],[`water`,`desert`,`e`,`lab`,`player`],`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,`water`                          ,`water`      ,[`water`,`desert`]       ,[`water`,`desert`]             ,[`water`,`desert`]             ,`water`           ,[`water`,`desert`],[`water`,`desert`]                   ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,[`water`,`land`,`snow`]          ,`water`      ,[`water`,`desert`,`e`,`snow`],[`water`,`land`]               ,[`water`,`desert`]             ,[`water`,`desert`],`water`           ,[`water`,`desert`]                   ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-e`    ,[`water`,`land`,`snow`,`monster`],`water`      ,`water`                  ,[`water`,`desert`,`e`,`heli-b`],[`water`,`desert`,`e`,`heli-b`],`water`           ,[`water`,`land`]  ,`water`                              ,`water`      ,`water`      ,`water`      ,`water-e-180` ],
      [ `water-c-270`,`water-e-270`                    ,`water-e-270`,`water-e-270`            ,`water-e-270`                  ,`water-e-270`                  ,`water-e-270`     ,`water-e-270`     ,`water-e-270`                        ,`water-e-270`,`water-e-270`,`water-e-270`,`water-c-180` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const { level } = game
      const heliBGenerator = level.everyId( `heli-b` )
      const heliToStart = heliBGenerator.next().value.entity
      const heliToMap2 = heliBGenerator.next().value.entity

      data.wav_map.play()

      if ( !data.map3_run ) data.map3_run = 1

      if ( data.map3_run == 1 ) {
        game.level.move( 8, 2, 4, heliToMap2.tileX, heliToMap2.tileY )
      }
      else if ( data.map3_run == 3 ) {
        game.level.move( 8, 2, 4, 3, 4 )
        game.moving = false
        await game.createDialog( `Tobie też się nie udało ;/<br>Dokładnie tak jak czuliśmy.`, `ranfin` )
        await game.createDialog( `Spiesz się do głównego labu. Tam używajac tego kryształu rozbijecie oko od srodka.`, `ranfin` )
        game.createDialog( `Leć bezpośrednio. Może zwabisz oko. Co prawda boi się nas atakować bo jest tu ciepło, ale i tak nie chcemy go tu.`, `ranfin` )
        await game.wait( 2 )
        game.moving = true
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    async events( eventInOrder, game ) {
      const data = game.storage.userData

      if ( eventInOrder == 0 && data.map3_run == 1 ) {
        game.moving = false
        await game.createDialog( `Jak pewnie zauważyliście atakuje nas duże zamrażajace oko.`, `player` )
        await game.createDialog( `Jako Ranfinowie na pewno macie coś czym można go pokonać.`, `player` )
        await game.createDialog( `Mamy jedynie niezbędny element co do tego.`, `ranfin` )
        await game.createDialog( `Możesz spróbować samodzielnie zawalczyć z okiem z tym narzędziem, ale to raczej nie zda się na wiele.`, `ranfin` )
        game.inventory( `set`, `coin`, 1 )
        game.moving = true
        data.map3_run = 2
        await game.createDialog( `Śmiało, zbliż się do niego i zaatakuj. Z bezpiecznej odległości nie uszkodzi Cię jakoś bardzo.`, `ranfin` )
      }
      else if ( eventInOrder == 1 && data.map3_run == 2 ) {
        data.fight_run = 2
        game.buildLevel( `fight` )
      }
      else if ( eventInOrder == 2 && data.map3_run == 3 ) {
        data.flyingFrom = `map3`
        data.flyingTo = `map1`
        data.flying3_run = 1
        data.flyingToStage = 5

        game.buildLevel( `flying3` )
      }
    }
  } ],
  [ `fight`, {
    gravity: true,
    tiles: [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [         ,        ,        ,        ,        ,`player` ],
      [ `brick` ,`brick` ,`brick` ,`brick` ,`brick` ,`brick` ,`brick` ,`brick` ,`brick` ,`brick` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const { ctxB, ctxF } = game
      const { width, height } = ctxB.canvas
      const p = game.player
      const shoot = (x, y) => new Promise( res => {
        const tile = game.level.get( x, y )
        if ( tile && tile[ tile.length - 1 ] == p ) {
          game.end( `killed`, `fight`, 1 )
          return res()
        }
        if ( tile === null || tile[ 0 ] ) return res()

        game.level.setEntity( `big_bullet`, x, y )

        setTimeout( () => {
          game.level.remove( x, y )

          if ( game.running ) shoot( x, y + 1 ).then( () => res() )
          else res()
        }, 300 )
      } )

      data.wav_fightAndFlying.play()

      ctxB.drawImage( data.fightingEye, 0, 0, width, height )

      if ( !data.fight_run ) data.fight_run = 1

      if ( data.fight_run == 1 ) {
        for ( let i = 0; i < 10; i++) {
          if ( !game.running ) return
          shoot( p.tileX, 0 )
          await game.wait( 1 )
        }

        game.createDialog( `Bardzo nieumiejętnie strzela xD`, `player` )

        for ( let i = 0; i < 20; i++) {
          if ( !game.running ) return
          shoot( p.tileX, 0 )
          await game.wait( 1 )
        }

        ctxB.clearRect( 0, 0, width, height )
        data.map1_run = 4
        game.buildLevel( `map1` )
      }
      else if ( data.fight_run == 2 ) {
        for ( let i = 0; i < 50; i++) {
          if ( !game.running ) return
          shoot( p.tileX, 0 )
          await game.wait( .7 )
        }

        for ( let i = 0; i < 30; i++) {
          if ( !game.running ) return
          shoot( p.tileX, 0 )
          await game.wait( .5 )
        }

        ctxB.clearRect( 0, 0, width, height )
        data.map3_run = 3
        game.buildLevel( `map3` )
      }


    },
    /** @param {Number} eventInOrder @param {Game} game */
    async events( eventInOrder, game ) {}
  } ],
  [ `intro`, {
    tiles: [ [ `monster`, `bullet` ] ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const cache = game.storage.userData
      const { map_firstJam, map_secondJam } = cache
      const { ctxB, ctxF } = game
      const { width, height } = ctxB.canvas

      const monster = game.level.everyId( `monster` ).next().value.entity
      const bullet = game.level.everyId( `bullet` ).next().value.entity

      const move = async (entity, x, y, i=100) => new Promise( res => {
        entity.translateX += x
        entity.translateY += y

        if (i <= 0) return res()

        i--

        setTimeout( () => move( entity, x, y, i ).then( () => res() ) , 1 )
      } )

      bullet.translateX = 1000
      monster.translateX = 1000

      if ( data.intro_run == 1 ) {
        game.storage.userData.wav_intro.play()
        ctxB.drawImage( map_secondJam, width / 2 - 250 / 2, height / 2 - 250 / 2, 250, 250 )

        await game.wait( 2.8 )

        monster.translateX = 70
        monster.translateY = 110
        monster.rotateAngle = 200

        await move( monster, -.5, -.14, 500 )
        monster.rotateAngle = 0
        await game.wait( 3 )

        setTimeout( async () => {
          bullet.translateX = -220
          bullet.translateY = 45
          await move( bullet, 1, .3, 145 )
          bullet.translateX = 1000

          await game.wait( .5 )

          bullet.translateX = -220
          bullet.translateY = 10
          await move( bullet, 1, .1, 200 )
          bullet.translateX = 1000

          await game.wait( .5 )

          bullet.translateX = -200
          bullet.translateY = -40
          await move( bullet, 1, .3, 100 )
          bullet.translateX = 1000
        }, 100 )


        await game.wait( .5 )
        await move( monster, .03, -.2, 520 )
        await game.wait( .5 )

        monster.rotateAngle = 350
        await move( monster, .5, -.1, 1111 )

        ctxB.clearRect( 0, 0, width, height )
        data.lab_run = 3
        game.buildLevel( `lab` )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      const data = game.storage.userData
    }
  } ],
  [ `flying1`, {
    flying: true,
    // gravity: true,
    tiles: [
      [ `mntn`,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,      ,[`e`,`heli-b`],    ,        ,        ,`cactus`, `mntn` ],
      [ `mntn`,        ,        ,        ,        ,`cactus`,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,`cactus`,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,`cactus`,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,`cactus`,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,`cactus`,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,`cactus`,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,`cactus`, `mntn` ],
      [ `mntn`,        ,        ,        ,`cactus`,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,`cactus`,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,`cactus`,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,`cactus`,        ,        ,        ,        ,        ,`cactus`,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,   ,[`heli-b`,`heli`],    ,        ,        ,        , `mntn` ],
      [ `mntn`,        ,        ,        ,        ,        ,        ,        ,        ,        ,        , `mntn` ],
      [ `mntn`,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  ,`mntn`  , `mntn` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const p = game.player
      const { ctxB, ctxF, level } = game
      const { width, height } = ctxB.canvas
      const heliBGenerator = level.everyId( `heli-b` )
      const shoot = (x, y) => new Promise( res => {
        const tile = level.get( x, y )
        if ( tile && tile[ tile.length - 1 ] == p ) {
          game.end( `killed`, `flying1`, 1 )
          return res()
        }
        if ( tile === null || !game.canStandOn( `bullet_ufo`, tile ) ) return res()

        level.setEntity( `bullet_ufo`, x, y )

        setTimeout( () => {
          level.remove( x, y )

          if ( game.running ) shoot( x, y + 1 ).then( () => res() )
          else res()
        }, 300 )
      } )

      data.wav_fightAndFlying.play()
      heliBGenerator.next()

      const heliB = heliBGenerator.next().value.entity

      game.drawingoffsets.x = (heliB.tileX - level.tiles[ heliB.tileY ].length / 2) * game.tileSize
      game.drawingoffsets.y = (heliB.tileY - level.tiles.length / 2) * game.tileSize

      level.move( p.tileX, p.tileY, p.tileL, heliB.tileX, heliB.tileY )

      ctxB.drawImage( data.grass, 0, 0, width, height )

      game.storage.killable = true

      if ( !data.flying1_run ) data.flying1_run = 1

      if ( data.flying1_run == 1 ) {
        data.interval = setInterval( () => {
          if ( p.tileY <= 4 ) clearInterval( data.interval )
          else shoot( p.tileX, 1 )
        }, 1000 * 1 )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      const data = game.storage.userData
      const { ctxB } = game

      game.storage.killable = false

      ctxB.clearRect( 0, 0, ctxB.canvas.width, ctxB.canvas.height )

      data[ `${data.flyingTo}_run` ] = data.flyingToStage
      game.buildLevel( data.flyingTo )
    }
  } ],
  [ `flying2`, {
    flying: true,
    // gravity: true,
    tiles: [
      [ `mntn`,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,       ,[`e`,`heli-b`],       ,        ,          ,`cactus-b`, `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus-b`,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus-b`,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus-b`, `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus-b`,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus-b`,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus-b`, `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus`  ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus-b`,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,`cactus-b`,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus`  ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus-b`,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus-b`,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,`cactus`,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,`cactus`,          ,          ,        ,          ,        ,`cactus-b`,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus`  ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus`  ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus`  ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus`  ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus-b`,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,`cactus`  ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus`  ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus`  ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus`  ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,`cactus`,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,`cactus`,          ,          ,        ,          ,        ,`cactus`  ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,     ,[`heli-b`,`heli`],      ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    , `mntn` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const p = game.player
      const { ctxB, ctxF, level } = game
      const { width, height } = ctxB.canvas
      const heliBGenerator = level.everyId( `heli-b` )
      const shoot = (x, y) => new Promise( res => {
        const tile = level.get( x, y )
        if ( tile && tile[ tile.length - 1 ] == p ) {
          game.end( `killed`, `flying2`, 1 )
          return res()
        }
        if ( tile === null || !game.canStandOn( `bullet_ufo`, tile ) ) return res()

        level.setEntity( `bullet_ufo`, x, y )

        setTimeout( () => {
          level.remove( x, y )

          if ( game.running ) shoot( x, y + 1 ).then( () => res() )
          else res()
        }, 300 )
      } )

      data.wav_fightAndFlying.play()
      heliBGenerator.next()

      const heliB = heliBGenerator.next().value.entity

      game.drawingoffsets.x = (heliB.tileX - level.tiles[ heliB.tileY ].length / 2) * game.tileSize
      game.drawingoffsets.y = (heliB.tileY - level.tiles.length / 2) * game.tileSize

      level.move( p.tileX, p.tileY, p.tileL, heliB.tileX, heliB.tileY )

      ctxB.drawImage( data.grass, 0, 0, width, height )

      game.storage.killable = true

      if ( !data.flying1_run ) data.flying1_run = 1

      if ( data.flying1_run == 1 ) {
        data.interval = setInterval( () => {
          if ( p.tileY <= 4 ) clearInterval( data.interval )
          else shoot( p.tileX, 1 )
        }, 1000 * .9 )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      const data = game.storage.userData
      const { ctxB } = game

      game.storage.killable = false

      ctxB.clearRect( 0, 0, ctxB.canvas.width, ctxB.canvas.height )

      data[ `${data.flyingTo}_run` ] = data.flyingToStage
      game.buildLevel( data.flyingTo )
    }
  } ],
  [ `flying3`, {
    flying: true,
    // gravity: true,
    tiles: [
      [ `mntn`,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,       ,[`e`,`heli-b`],       ,        ,          ,`cactus-b`, `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus-b`,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus-b`,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,`cactus`,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,`cactus`,          ,          ,        ,          ,        ,`cactus-b`,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus`  ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus`  ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus`  ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus`  ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus-b`,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,`cactus`  ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus`  ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus`  ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus`  ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,`cactus`,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,`cactus`,          ,          ,        ,          ,        ,`cactus`  ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus-b`,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus-b`, `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus-b`,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus`  ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus-b`,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus-b`, `mntn` ],
      [ `mntn`,          ,          ,        ,`cactus`  ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,`cactus-b`,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,`cactus-b`,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,`cactus`  ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,`cactus-b`,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,`cactus`  , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,     ,[`heli-b`,`heli`],      ,        ,          ,          , `mntn` ],
      [ `mntn`,          ,          ,        ,          ,          ,        ,          ,        ,          ,          , `mntn` ],
      [ `mntn`,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`  ,`mntn`    ,`mntn`    , `mntn` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      const data = game.storage.userData
      const p = game.player
      const { ctxB, ctxF, level } = game
      const { width, height } = ctxB.canvas
      const heliBGenerator = level.everyId( `heli-b` )
      const shootUfo = (x, y) => new Promise( res => {
        const tile = level.get( x, y )
        if ( tile && tile[ tile.length - 1 ] == p ) {
          game.end( `killed`, `flying3`, 1 )
          return res()
        }
        if ( tile === null || !game.canStandOn( `bullet_ufo`, tile ) ) return res()

        level.setEntity( `bullet_ufo`, x, y )

        setTimeout( () => {
          level.remove( x, y )

          if ( game.running ) shootUfo( x, y + 1 ).then( () => res() )
          else res()
        }, 300 )
      } )
      const shootMonster = (x, y, fromRToL) => new Promise( res => {
        const tile = level.get( x, y )

        if ( tile && tile[ tile.length - 1 ] == p ) {
          game.end( `freezed`, `flying3`, 1 )
          return res()
        }
        if ( tile === null || !game.canStandOn( `monster`, tile ) ) return res()

        level.setEntity( `monster`, x, y )

        setTimeout( () => {
          level.remove( x, y )

          if ( game.running ) shootMonster( x + (fromRToL ? 1 : -1), y, fromRToL ).then( () => res() )
          else res()
        }, 500 )
      } )

      data.wav_fightAndFlying.play()
      heliBGenerator.next()

      const heliB = heliBGenerator.next().value.entity

      game.drawingoffsets.x = (heliB.tileX - level.tiles[ heliB.tileY ].length / 2) * game.tileSize
      game.drawingoffsets.y = (heliB.tileY - level.tiles.length / 2) * game.tileSize

      level.move( p.tileX, p.tileY, p.tileL, heliB.tileX, heliB.tileY )

      ctxB.drawImage( data.grass, 0, 0, width, height )

      game.storage.killable = true

      if ( !data.flying1_run ) data.flying1_run = 1

      if ( data.flying1_run == 1 ) {
        let j = 0
        const indices = [ 0, level.tiles[ 0 ].length - 1 ]

        data.interval = setInterval( () => {
          if ( p.tileY <= 4 ) clearInterval( data.interval )
          else {
            shootUfo( p.tileX, 1 )

            if (j % 7 == 0) shootMonster( 0, p.tileY, true ) // indices[ j % 2 ], j % 2 == 0
            j++
          }
        }, 1000 * .9 )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      const data = game.storage.userData
      const { ctxB } = game

      game.storage.killable = false

      ctxB.clearRect( 0, 0, ctxB.canvas.width, ctxB.canvas.height )

      data[ `${data.flyingTo}_run` ] = data.flyingToStage
      game.buildLevel( data.flyingTo )
    }
  } ],
] )