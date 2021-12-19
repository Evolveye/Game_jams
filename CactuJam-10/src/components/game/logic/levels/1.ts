import Gift from "../entities/Gift"
import Path from "../entities/Path"
import Player from "../entities/Player"
import Level from "../Level"


export default new Level({
  symbolDefs: {
    g: (x, y) => new Gift(x, y, { size:0.5 }),
    p: (x, y) => new Path(x, y),
    P: (x, y) => new Player(x, y),
  },
  board: [
    [ ``, `p` ],
    [ `p`, [ `p`, `g`, `P` ], `p` ],
    [ ``, `p` ],
    [ ``, `p` ],
    [ ``, `p` ],
    [ ``, `p` ],
  ],
  script( level ) {
    const player = level.getEntities( `player` )[ 0 ]

    level.game.setHugForEntity( player )
  },
})
