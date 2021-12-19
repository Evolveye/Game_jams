import Path from "../entities/Path"
import Player from "../entities/Player"
import TiledLevel from "../TiledLevel"


export default new TiledLevel({
  symbolDefs: {
    p: (x, y, size) => new Path(x, y, { size }),
    P: (x, y, size) => new Player(x, y, { size }),
  },
  board: [
    [ `` ],
    [ [ `p`, `P` ] ],
    [ `` ],
  ],
})
