import { rhythmGameAudio, type RhythmGameBar, type RhythmGameLevel } from "./level0"

const leftDefaults = { x:300, keys:[ `left` ] }
const rightDefaults = { x:500, keys:[ `right` ] }

const jDefaults = { x:-500, keys:[ `a` ] }
const lDefaults = { x:-300, keys:[ `d` ] }

export function getLevel3() {
  const bars1:RhythmGameBar[] = [
    { timeMs:8272, ...rightDefaults },
    { timeMs:9213, ...leftDefaults },
    { timeMs:9807, ...rightDefaults },
    { timeMs:10276, lasts:800, ...leftDefaults },
    { timeMs:12354, ...rightDefaults },
    { timeMs:13310, ...leftDefaults },
    { timeMs:13803, ...rightDefaults },
    { timeMs:14270, ...leftDefaults },
    { timeMs:14744, ...rightDefaults },
    { timeMs:15235, lasts:700, ...leftDefaults },
    { timeMs:16420, ...rightDefaults },
    { timeMs:17263, ...leftDefaults },
    { timeMs:18334, lasts:1200, ...rightDefaults },
    { timeMs:20264, ...leftDefaults },
    { timeMs:21310, ...rightDefaults },
    { timeMs:22292, ...leftDefaults },
    { timeMs:22821, ...rightDefaults },
    { timeMs:23320, lasts:600, ...leftDefaults },
    { timeMs:24262, ...rightDefaults },
    { timeMs:25269, ...leftDefaults },
    { timeMs:26344, lasts:1000, ...rightDefaults },
    { timeMs:28309, ...leftDefaults },
    { timeMs:29314, ...rightDefaults },
    { timeMs:29793, ...leftDefaults },
    { timeMs:30309, ...rightDefaults },
    { timeMs:30763, ...leftDefaults },
    { timeMs:31285, lasts:600, ...rightDefaults },
    { timeMs:32291, ...leftDefaults },
    { timeMs:32636, ...rightDefaults },
    { timeMs:33268, ...leftDefaults },
    { timeMs:33610, ...rightDefaults },
    { timeMs:34298, ...leftDefaults },
    { timeMs:34672, ...rightDefaults },
    { timeMs:35019, lasts:700, ...leftDefaults },
    { timeMs:36301, ...rightDefaults },
    { timeMs:36620, ...leftDefaults },
    { timeMs:37335, ...rightDefaults },
    { timeMs:37602, ...leftDefaults },
    { timeMs:38273, ...rightDefaults },
    { timeMs:38582, ...leftDefaults },
    { timeMs:38984, lasts:500, ...rightDefaults },
    { timeMs:39622, lasts:200, ...leftDefaults },
    { timeMs:40272, ...rightDefaults },
    { timeMs:40651, ...leftDefaults },
    { timeMs:41318, ...rightDefaults },
    { timeMs:41628, lasts:400, ...leftDefaults },
    { timeMs:42328, ...rightDefaults },
    { timeMs:42648, ...leftDefaults },
    { timeMs:43013, lasts:800, ...rightDefaults },
    { timeMs:44244, ...leftDefaults },
    { timeMs:44634, lasts:500, ...rightDefaults },
    { timeMs:45334, ...leftDefaults },
    { timeMs:45664, lasts:300, ...rightDefaults },
    { timeMs:46111, ...leftDefaults },
    { timeMs:46350, lasts:900, ...rightDefaults },
    { timeMs:48239, ...leftDefaults },
    { timeMs:49312, ...rightDefaults },
    { timeMs:50460, lasts:1100, ...leftDefaults },
    { timeMs:52286, lasts:600, ...rightDefaults },
    { timeMs:53285, lasts:700, ...leftDefaults },
    { timeMs:54351, lasts:300, ...rightDefaults },
    { timeMs:54905, lasts:200, ...leftDefaults },
    { timeMs:55370, lasts:600, ...rightDefaults },
    { timeMs:56298, lasts:600, ...leftDefaults },
    { timeMs:57284, lasts:600, ...rightDefaults },
    { timeMs:58287, lasts:1100, ...leftDefaults },
    { timeMs:60267, lasts:700, ...rightDefaults },
    { timeMs:61267, lasts:300, ...leftDefaults },
    { timeMs:61851, lasts:200, ...rightDefaults },
    { timeMs:62334, lasts:300, ...leftDefaults },
    { timeMs:62843, lasts:200, ...rightDefaults },
    { timeMs:63259, lasts:600, ...leftDefaults },
    { timeMs:64321, ...rightDefaults },
    { timeMs:65345, lasts:500, ...rightDefaults },
    { timeMs:66279, lasts:1500, ...leftDefaults },
    { timeMs:68253, lasts:700, ...rightDefaults },
    { timeMs:69310, lasts:600, ...leftDefaults },
    { timeMs:70344, lasts:300, ...rightDefaults },
    { timeMs:70864, lasts:200, ...leftDefaults },
    { timeMs:71353, lasts:600, ...rightDefaults },
    { timeMs:72267, lasts:600, ...leftDefaults },
    { timeMs:73261, lasts:700, ...rightDefaults },
    { timeMs:74313, lasts:1100, ...leftDefaults },
    { timeMs:76288, ...rightDefaults },
    { timeMs:77294, ...leftDefaults },
    { timeMs:77834, ...rightDefaults },
    { timeMs:78329, ...leftDefaults },
    { timeMs:78817, ...rightDefaults },
    { timeMs:79255, lasts:600, ...leftDefaults },
    { timeMs:80354, ...rightDefaults },
    { timeMs:84752, ...leftDefaults },
    { timeMs:88681, ...rightDefaults },
    { timeMs:92676, ...leftDefaults },
  ]
  bars1.forEach( b => b.timeMs -= 5900 )

  const bars2:RhythmGameBar[] = [
    { timeMs:2976, ...lDefaults },
    { timeMs:3290, ...jDefaults },
    { timeMs:3548, ...lDefaults },
    { timeMs:3805, ...jDefaults },
    { timeMs:4065, ...lDefaults },
    { timeMs:4323, lasts:1600, ...jDefaults },
    { timeMs:6999, ...lDefaults },
    { timeMs:7272, ...jDefaults },
    { timeMs:7539, ...lDefaults },
    { timeMs:7806, ...jDefaults },
    { timeMs:8049, ...lDefaults },
    { timeMs:8304, lasts:600, ...jDefaults },
    { timeMs:9114, ...lDefaults },
    { timeMs:9523, lasts:800, ...jDefaults },
    { timeMs:11027, ...lDefaults },
    { timeMs:11279, ...jDefaults },
    { timeMs:11540, ...lDefaults },
    { timeMs:11816, ...jDefaults },
    { timeMs:12064, ...lDefaults },
    { timeMs:12303, lasts:600, ...jDefaults },
    { timeMs:13486, lasts:500, ...lDefaults },
    { timeMs:14053, lasts:300, ...jDefaults },
    { timeMs:14562, ...lDefaults },
    { timeMs:14783, ...jDefaults },
    { timeMs:15040, ...lDefaults },
    { timeMs:15747, ...jDefaults },
    { timeMs:15982, ...lDefaults },
    { timeMs:16273, lasts:400, ...jDefaults },
    { timeMs:17022, ...lDefaults }, // { timeMs:17022, lasts:200, ...dDefaults }
    { timeMs:17507, lasts:600, ...jDefaults },
    { timeMs:35051, ...lDefaults },
    { timeMs:35315, ...jDefaults },
    { timeMs:35530, ...lDefaults },
    { timeMs:35796, ...jDefaults },
    { timeMs:36015, ...lDefaults },
    { timeMs:36308, lasts:1700, ...jDefaults },
    { timeMs:39059, ...lDefaults },
    { timeMs:39307, ...jDefaults },
    { timeMs:39544, ...lDefaults },
    { timeMs:39789, ...jDefaults },
    { timeMs:40016, ...lDefaults },
    { timeMs:40320, lasts:600, ...jDefaults },
    { timeMs:41144, ...lDefaults },
    { timeMs:41592, lasts:700, ...jDefaults },
    { timeMs:43052, ...lDefaults },
    { timeMs:43304, ...jDefaults },
    { timeMs:43530, ...lDefaults },
    { timeMs:43787, ...jDefaults },
    { timeMs:44049, ...lDefaults },
    { timeMs:44346, lasts:900, ...jDefaults },
    { timeMs:45566, ...lDefaults }, // { timeMs:45566, lasts:200, ...dDefaults }
    { timeMs:46051, ...jDefaults }, // { timeMs:46051, lasts:200, ...aDefaults }
    { timeMs:46529, ...lDefaults },
    { timeMs:46809, ...jDefaults },
    { timeMs:47056, lasts:500, ...lDefaults },
    { timeMs:48005, ...jDefaults },
    { timeMs:48220, ...lDefaults },
    { timeMs:48441, lasts:500, ...jDefaults },
    { timeMs:49116, ...lDefaults }, // { timeMs:49116, lasts:200, ...dDefaults }
    { timeMs:49573, lasts:600, ...jDefaults },
    { timeMs:50572, ...lDefaults }, // { timeMs:50572, lasts:200, ...dDefaults }
    { timeMs:50983, ...jDefaults },
    { timeMs:51314, ...lDefaults },
    { timeMs:51564, ...jDefaults },
    { timeMs:51810, ...lDefaults },
    { timeMs:52052, ...jDefaults },
    { timeMs:52299, lasts:1700, ...lDefaults },
    { timeMs:55050, ...jDefaults },
    { timeMs:55283, ...lDefaults },
    { timeMs:55550, ...jDefaults },
    { timeMs:55791, ...lDefaults },
    { timeMs:56076, ...jDefaults },
    { timeMs:56326, lasts:600, ...lDefaults },
    { timeMs:57095, ...jDefaults }, // { timeMs:57095, lasts:200, ...aDefaults }
    { timeMs:57549, lasts:700, ...lDefaults },
    { timeMs:59047, ...jDefaults },
    { timeMs:59309, ...lDefaults },
    { timeMs:59555, ...jDefaults },
    { timeMs:59776, ...lDefaults },
    { timeMs:60037, ...jDefaults },
    { timeMs:60285, lasts:900, ...lDefaults },
    { timeMs:61540, ...jDefaults }, // { timeMs:61540, lasts:200, ...aDefaults }
    { timeMs:62020, ...lDefaults }, // { timeMs:62020, lasts:200, ...dDefaults }
    { timeMs:62529, ...jDefaults },
    { timeMs:62793, ...lDefaults },
    { timeMs:63056, ...jDefaults }, // { timeMs:63056, lasts:200, ...aDefaults }
    { timeMs:63662, ...lDefaults },
    { timeMs:63944, ...jDefaults },
    { timeMs:64193, lasts:500, ...lDefaults },
    { timeMs:65013, ...jDefaults }, // { timeMs:65013, lasts:200, ...aDefaults },
    { timeMs:65501, lasts:500, ...lDefaults },
    { timeMs:66562, ...jDefaults }, // { timeMs:66562, lasts:200, ...aDefaults }
    { timeMs:66937, ...lDefaults }, // { timeMs:66937, lasts:200, ...dDefaults },
    { timeMs:67555, ...jDefaults },
    { timeMs:67873, lasts:400, ...lDefaults },
    { timeMs:68592, ...jDefaults },
    { timeMs:68920, ...lDefaults },
    { timeMs:69315, lasts:800, ...jDefaults },
    { timeMs:70512, ...lDefaults },
    { timeMs:70909, lasts:400, ...jDefaults },
    { timeMs:71578, ...lDefaults },
    { timeMs:71896, lasts:400, ...jDefaults },
    { timeMs:72571, ...lDefaults },
    { timeMs:72905, ...jDefaults },
    { timeMs:73273, ...lDefaults },
    { timeMs:73667, lasts:700, ...jDefaults },
    { timeMs:74551, ...lDefaults },
    { timeMs:74873, lasts:500, ...jDefaults },
    { timeMs:75573, ...lDefaults },
    { timeMs:75872, lasts:500, ...jDefaults },
    { timeMs:76603, ...lDefaults },
    { timeMs:76925, ...jDefaults },
    { timeMs:77253, lasts:900, ...lDefaults },
    { timeMs:78601, ...jDefaults },
    { timeMs:78907, lasts:500, ...lDefaults },
    { timeMs:79653, ...jDefaults },
    { timeMs:79933, ...lDefaults }, // { timeMs:79933, lasts:200, ...dDefaults },
    { timeMs:80308, ...jDefaults },
    { timeMs:80537, lasts:1000, ...lDefaults },
  ]
  bars2.forEach( b => b.timeMs += 7900 )

  const bars = [
    ...bars1,
    ...bars2,
  ].sort( (a, b) => Math.sign( a.timeMs - b.timeMs ) )

  return { inOrder:4, name:`Niemożliwa łąka`, bonus:true, bars, audio:rhythmGameAudio.bitArcade } satisfies RhythmGameLevel
}
