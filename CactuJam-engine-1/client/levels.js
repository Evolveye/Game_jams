import { Level } from "./engine"

export default [
  new Level( {
    tiles: [
      [ [ `b0`, `f0-90` ],   `b0`,        [ `b0`, `c` ], [ `b0`, `c` ] ],
      [ `b0`,           [ `b0`, `c` ],   `b0`,          `b0` ],
      [ `b0`,             `b0`,        [ `b0`, `f0` ],  `b0` ]
    ],
    script() {}
  } )
]