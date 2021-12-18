import Player from "../entities/Player"
import TiledLevel from "../TiledLevel"


export default new TiledLevel({
  symbolDefs: {
    P: (x, y) => new Player(x, y),
  },
  board: [
    [ `` ],
    [ `P` ],
    [ `P` ],
  ],
})
