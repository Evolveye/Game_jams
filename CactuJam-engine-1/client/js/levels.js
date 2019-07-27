import Game from "./engine.js"

/** @type {Map<String,{ tiles:Any script:Function events:Function }>} */
export default new Map( [
  [ `lobby`, {
    tiles: [
      [ `wall-corner-90`, `wall-180`,        `wall-180`, `wall-180`, `wall-180`,    `wall-180`, `wall-180`,    `wall-180`, `wall-180`, `wall-180`, `wall-180`, `wall-180`, `wall-180`, `wall-180`, `wall-window-180`, `wall-180`, `wall-180`, `wall-corner-180` ],
      [ `wall-90`,       [`floor`,`player`], `floor`,    `floor`,    `floor`,       `floor`,    `floor`,       `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,           `floor`,    `floor`,    `wall-270` ],
      [ `wall-90`,        `floor`,           `floor`,    `floor`,    `floor`,       `floor`,    `floor`,       `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,           `floor`,    `floor`,    `wall-270` ],
      [ `wall-90`,        `floor`,           `floor`,    `floor`,    `floor`,       `floor`,    `floor`,       `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,           `floor`,    `floor`,    `wall-270` ],
      [ `wall-90`,       [`empty`,`floor`],  `floor`,    `floor`,    `floor`,       `floor`,    `floor`,       `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,    `floor`,           `floor`,    `floor`,    `wall-270` ],
      [ `wall-corner`,    `wall-door`,       `wall`,     `wall`,     `wall-window`, `wall`,     `wall-window`, `wall`,     `wall`,     `wall`,     `wall`,     `wall`,     `wall`,     `wall`,     `wall`,            `wall`,     `wall`,     `wall-corner-270` ],
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
      [ `water-corner`,     `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-end-90`,  `water-corner-90`  ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-end`,        `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water`,         `water-end-180` ],
      [ `water-corner-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-end-270`, `water-corner-180` ],
      [],
      [,,,,,,,,`water-aside`],
      [ `water-aside` ],
      [,,,,`wall-corner-90`, `wall-180`,       `wall-180`,        `wall-180`,               `wall-180`,                      `wall-corner-180` ],
      [,,,,`wall-90`,       [`empty`,`floor`],[`floor`,`player`],[`empty`,`floor`,`arrow`],[`empty`,`floor`,`arrow-circle`], `wall-270` ],
      [,,,,`wall-corner`,    `wall-door`,      `wall`,            `wall`,                   `wall`,                          `wall-corner-270` ]
    ],
    /** @param {Game} game */
    async script( game ) {
      if ( game.level.runCounter == 1 ) {
        game.inventory( `set`, `cactus`, 1 )
        game.inventory( `set`, `land`, 3 )
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