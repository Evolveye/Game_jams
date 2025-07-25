import { leftDefaults, rhythmGameAudio, rightDefaults, type RhythmGameBar, type RhythmGameLevel } from "./level0"

export function getLevel4() {
  const bars:RhythmGameBar[] = [
    { timeMs:5343, ...rightDefaults },
    { timeMs:5513, ...leftDefaults },
    { timeMs:5930, ...rightDefaults },
    { timeMs:6247, ...leftDefaults },
    { timeMs:6487, ...rightDefaults },
    { timeMs:6936, ...leftDefaults },
    { timeMs:7122, ...rightDefaults },
    { timeMs:7508, ...leftDefaults },
    { timeMs:7796, ...rightDefaults },
    { timeMs:8080, ...leftDefaults },
    { timeMs:8536, ...rightDefaults },
    { timeMs:8738, ...leftDefaults },
    { timeMs:9134, ...rightDefaults },
    { timeMs:9473, ...leftDefaults },
    { timeMs:9731, ...rightDefaults },
    { timeMs:10164, ...leftDefaults },
    { timeMs:10360, ...rightDefaults },
    { timeMs:10725, ...leftDefaults },
    { timeMs:10999, ...rightDefaults },
    { timeMs:11256, ...leftDefaults },
    { timeMs:11739, ...rightDefaults },
    { timeMs:11917, ...leftDefaults },
    { timeMs:12339, ...rightDefaults },
    { timeMs:12624, ...leftDefaults },
    { timeMs:12913, ...rightDefaults },
    { timeMs:13355, ...leftDefaults },
    { timeMs:13547, ...rightDefaults },
    { timeMs:13963, ...leftDefaults },
    { timeMs:14280, ...rightDefaults },
    { timeMs:14525, ...leftDefaults },
    { timeMs:14957, ...rightDefaults },
    { timeMs:15131, ...leftDefaults },
    { timeMs:15526, ...rightDefaults },
    { timeMs:15812, ...leftDefaults },
    { timeMs:16109, ...rightDefaults },
    { timeMs:16535, ...leftDefaults },
    { timeMs:16770, ...rightDefaults },
    { timeMs:17152, ...leftDefaults },
    { timeMs:18121, ...rightDefaults },
    { timeMs:18316, ...leftDefaults },
    { timeMs:18755, ...rightDefaults },
    { timeMs:19052, ...leftDefaults },
    { timeMs:19336, ...rightDefaults },
    { timeMs:19796, ...leftDefaults },
    { timeMs:19969, ...rightDefaults },
    { timeMs:20352, ...leftDefaults },
    { timeMs:20646, ...rightDefaults },
    { timeMs:20921, ...leftDefaults },
    { timeMs:21377, ...rightDefaults },
    { timeMs:21570, ...leftDefaults },
    { timeMs:21925, ...rightDefaults },
    { timeMs:22190, ...leftDefaults },
    { timeMs:22549, ...rightDefaults },
    { timeMs:22948, ...leftDefaults },
    { timeMs:23172, ...rightDefaults },
    { timeMs:23393, ...leftDefaults },
    { timeMs:23590, ...rightDefaults },
    { timeMs:24613, ...leftDefaults },
    { timeMs:25114, ...rightDefaults },
    { timeMs:25334, ...leftDefaults },
    { timeMs:25814, ...rightDefaults },
    { timeMs:26213, ...leftDefaults },
    { timeMs:26594, ...rightDefaults },
    { timeMs:27004, lasts:400, ...leftDefaults },
    { timeMs:27598, lasts:400, ...rightDefaults },
    { timeMs:28347, ...leftDefaults },
    { timeMs:28556, ...rightDefaults },
    { timeMs:28960, ...leftDefaults },
    { timeMs:29301, ...rightDefaults },
    { timeMs:29765, ...leftDefaults },
    { timeMs:30123, lasts:500, ...rightDefaults },
    { timeMs:30780, lasts:400, ...leftDefaults },
    { timeMs:31505, ...rightDefaults },
    { timeMs:31765, ...leftDefaults },
    { timeMs:32158, ...rightDefaults },
    { timeMs:32568, ...leftDefaults },
    { timeMs:32932, ...rightDefaults },
    { timeMs:33326, lasts:500, ...leftDefaults },
    { timeMs:33988, ...rightDefaults },
    { timeMs:34741, ...leftDefaults },
    { timeMs:34929, ...rightDefaults },
    { timeMs:35582, ...leftDefaults },
    { timeMs:35908, ...rightDefaults },
    { timeMs:36265, ...leftDefaults },
    { timeMs:36614, lasts:400, ...rightDefaults },
    { timeMs:37209, lasts:400, ...leftDefaults },
    { timeMs:37938, ...rightDefaults },
    { timeMs:38150, ...leftDefaults },
    { timeMs:38562, ...rightDefaults },
    { timeMs:38923, ...leftDefaults },
    { timeMs:39329, ...rightDefaults },
    { timeMs:39687, lasts:500, ...leftDefaults },
    { timeMs:40422, ...rightDefaults },
    { timeMs:41130, ...leftDefaults },
    { timeMs:41345, ...rightDefaults },
    { timeMs:41737, ...leftDefaults },
    { timeMs:42129, ...rightDefaults },
    { timeMs:42508, ...leftDefaults },
    { timeMs:42923, lasts:400, ...rightDefaults },
    { timeMs:43596, ...leftDefaults },
    { timeMs:44319, ...rightDefaults },
    { timeMs:44613, ...leftDefaults },
    { timeMs:44964, ...rightDefaults },
    { timeMs:45313, ...leftDefaults },
    { timeMs:45754, ...rightDefaults },
    { timeMs:46122, lasts:400, ...leftDefaults },
    { timeMs:46788, lasts:400, ...rightDefaults },
    { timeMs:47529, ...leftDefaults },
    { timeMs:47763, ...rightDefaults },
    { timeMs:48183, lasts:200, ...leftDefaults },
    { timeMs:48672, ...rightDefaults },
    { timeMs:48976, ...leftDefaults },
    { timeMs:49413, lasts:200, ...rightDefaults },
    { timeMs:49913, lasts:600, ...leftDefaults },
    { timeMs:50796, ...rightDefaults },
    { timeMs:51167, ...leftDefaults },
    { timeMs:51565, ...rightDefaults },
    { timeMs:51769, ...leftDefaults },
    { timeMs:52096, ...rightDefaults },
    { timeMs:52363, lasts:200, ...leftDefaults },
    { timeMs:52822, ...rightDefaults },
    { timeMs:53181, lasts:200, ...leftDefaults },
    { timeMs:53913, ...rightDefaults },
    { timeMs:54355, ...leftDefaults },
    { timeMs:54564, ...rightDefaults },
    { timeMs:54994, ...leftDefaults },
    { timeMs:55201, ...rightDefaults },
    { timeMs:55913, ...leftDefaults },
    { timeMs:56346, lasts:300, ...rightDefaults },
  ]
  bars.forEach( b => b.timeMs += 2300 )

  const keys = [ `left`, `right` ]
  const indices = new Set<number>()
  let shuffleBarsCount = Math.floor( bars.length * 0.6 )

  let tries = 100
  while (tries-- > 0 && shuffleBarsCount > 0) {
    const index = Math.floor( Math.random() * bars.length )

    if (indices.has( index )) continue

    shuffleBarsCount--
    indices.add( index )
    bars[ index ].x = Math.floor( Math.random() * 600 ) - 300
    bars[ index ].keys = [ keys[ Math.floor( Math.random() * keys.length ) ] ]
  }


  return { inOrder:5, name:`Ranfisz<br>vs<br>złe korporacje`, bars, audio:rhythmGameAudio.hyperionHypercube } satisfies RhythmGameLevel
}
