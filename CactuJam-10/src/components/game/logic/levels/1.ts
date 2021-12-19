import Path from "../entities/Path"
import Player from "../entities/Player"
import TiledLevel from "../TiledLevel"


export default new TiledLevel({
  symbolDefs: {
    p: (x, y) => new Path(x, y),
    P: (x, y) => new Player(x, y),
    P2: (x, y) => new Player(x, y, .5),
  },
  board: [
    [ `` ],
    [ `P` ],
    [ [ `p`, `P2` ] ],
  ],
})
