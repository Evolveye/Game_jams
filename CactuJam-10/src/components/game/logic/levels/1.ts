import Player from "../entities/Player"
import TiledLevel from "../TiledLevel"


export default new TiledLevel({
  symbolDefs: {
    P: (x, y) => new Player(x, y),
    P2: (x, y) => new Player(x, y, .5),
  },
  board: [
    [ `` ],
    [ `P` ],
    [ `P2` ],
  ],
})
