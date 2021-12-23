import Gift from "../entities/Gift"
import House from "../entities/House"
import Path from "../entities/Path"
import Player from "../entities/Player"
import Level from "../Level"
import LevelCell from "../LevelCell"


export default new Level({
  symbolDefs: {
    X: (x, y) => null,
    " ": (x, y) => new Path(x, y),
    g: (x, y) => new Gift(x, y),
    P: (x, y) => new Player(x, y),
    H: (x, y) => [ new Path(x, y), new House(x, y) ],
  },
  board: [
    [ `        XX` ],
    [ `          ` ],
    [ `          ` ],
    [ `          ` ],
    [ `          ` ],
    [ ` H        ` ],
    [ `          ` ],
    [ `          ` ],
    [ `X      X  ` ],
    [ `XX        ` ],
  ],
  async script( level ) {
    const player = level.spawn( new Player( 1, 1 ) )
    const rand = () => Math.floor( Math.random() * 10 )
    const sleep = (ms = 1000) => new Promise( r => setTimeout( r, ms ) )

    level.game.setActiveEntity( player )

    // level.spawn( new Path( 3, 1 ) )
    // level.spawn( new Path( 4, 1 ) )

    while (true) {
      let cell:LevelCell

      for (let i = 0, found = false;  i < 10 && !found;  ++i) {
        const maybeCell = level.getCell( rand(), rand(), true )

        if (maybeCell.getData().filter( c => c instanceof Path ).length === 1) {
          cell = maybeCell
          break
        }
      }

      if (cell) {
        level.spawn( new Gift( cell.x, cell.y ) )
      }

      await sleep( 1000 * 5 )
    }
  },
})
