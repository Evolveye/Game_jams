import Game from "./engine.js"

/** @type {Map<String,{ tiles:Any script:Function events:Function }>} */
export default new Map( [
  [ `lobby`, {
    tiles: [
      [ `lc-90`,  `lw0-180`,  `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw0-180`, `lw1-180`, `lw0-180`, `lw0-180`, `lc-180` ],
      [ `lw0-90`,[`lb0`,`p`], `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lw0-270` ],
      [ `lw0-90`, `lb0`,      `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lw0-270` ],
      [ `lw0-90`, `lb0`,      `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lw0-270` ],
      [ `lw0-90`,[`e`,`lb0`], `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lb0`,     `lw0-270` ],
      [ `lc`,     `lw2`,      `lw0`,     `lw0`,     `lw1`,     `lw0`,     `lw1`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lw0`,     `lc-270` ],
    ],
    /** @param {Game} game */
    async script( game ) {
      if ( game.level.runCounter != 1 ) return

      await new Promise( res => setTimeout( () => res(),1000 * 10 ) )
      game.createDialog( `Witam serdecznie. Jak widać, osoba wypowiadajaca sie to pacman którym sterujesz.`, `p` )
      await new Promise( res => setTimeout( () => res(),1000 * 20 ) )
      game.createDialog( `
        To co tu widzisz, to JUŻ PRAWIE gotowy silnik pod retro pikselowo-planszową grę, zawierajacą narrację,
        powrót do przeszłosci mojej wyspy i tego jak powstawała, oraz różne ciekawe mechaniki.
      `, `p` )
      await new Promise( res => setTimeout( () => res(),1000 * 15 ) )
      game.createDialog( `
        Mimo, że plany były tym razem bardziej przemyślane niż zawsze, to doprowadziło to autora do zguby.
      `, `p` )
      await new Promise( res => setTimeout( () => res(),1000 * 10 ) )
      game.createDialog( `
        No po prostu źle wycyrkulował czas potrzebny na stworzenie czegoś ciekawego. ¯\\_(ツ)_/¯
      `, `p` )
      await new Promise( res => setTimeout( () => res(),1000 * 20 ) )
      game.createDialog( `
        Nie, nie ma tu nawet responsywności. Nie oczekuj zbyt wiele :somek:
      `, `p` )
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      game.buildLevel( `island` )
    }
  } ],
  [ `island`, {
    tiles: [
      [ `ic`,     `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `iw-90`,  `ic-90`  ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `iw`,     `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `ib0`,    `iw-180` ],
      [ `ic-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `iw-270`, `ic-180` ],
      [],
      [,,,,,,,,`ia`],
      [ `ia` ],
      [,,,,`lc-90`,  `lw0-180`,  `lw0-180`,  `lw0-180`,      `lw0-180`,      `lc-180` ],
      [,,,,`lw0-90`,[`e`,`lb0`],[`lb0`,`p`],[`e`,`lb0`,`>`],[`e`,`lb0`,`R`], `lw0-270` ],
      [,,,,`lc`, `lw2`,  `lw0`,  `lw0`,      `lw0`,      `lc-270` ]
    ],
    /** @param {Game} game */
    async script( game ) {
      if ( game.level.runCounter == 1 ) {
        game.inventory( `set`, `c`, 1 )
        game.inventory( `set`, `ib1-1000`, 1 )
      }
    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {
      const { level } = game
      const { sprites } = game.storage

      if ( eventInOrder == 0 ) game.buildLevel( `lobby` )
      else if ( eventInOrder == 1 ) {
        for ( const { entity } of level.everyEntity() )
          if ( entity.evolve ) entity.evolve( game )
      }
      else if ( eventInOrder == 2 ) window.location.reload()
    }
  } ]
] )