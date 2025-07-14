import pixelFantasiaAudioSrc from "./pixel-fantasia.mp3"
import hyperionHypercubeAudioSrc from "./hyperion-hypercube.mp3"
import bitArcadeAudioSrc from "./8-bit-arcade.mp3"
import type { KeyName } from "../Keys"

export type RhythmGameBar = {
  keys: KeyName[]
  timeMs: number
  x: number
  lasts?: number
  speed?: number
}

export type RhythmGameLevel = {
  name: string
  inOrder: number
  skipTime?: number
  bonus?: true
  bars: RhythmGameBar[]
  audio: HTMLAudioElement
}

function createAudio( src:string ) {
  const audio = new Audio( src )
  audio.preload = `auto`
  audio.load()
  return audio
}

export const rhythmGameAudio = {
  pixelFantasia: createAudio( pixelFantasiaAudioSrc ),
  bitArcade: createAudio( bitArcadeAudioSrc ),
  hyperionHypercube: createAudio( hyperionHypercubeAudioSrc ),
}

export const leftKeys = [ `left` ] as const satisfies KeyName[]
export const leftDefaults = { x:-100, keys:leftKeys }
export const rightKeys = [ `right` ] as const satisfies KeyName[]
export const rightDefaults = { x:100, keys:rightKeys }

export function getLevel0() {
  const bars:RhythmGameBar[] = [
    { timeMs:11098, ...rightDefaults },
    { timeMs:12458, ...leftDefaults },
    { timeMs:13899, lasts:800, ...rightDefaults },
    { timeMs:16641, ...leftDefaults },
    { timeMs:18004, ...rightDefaults },
    { timeMs:19374, lasts:800, ...leftDefaults },
    { timeMs:22173, ...rightDefaults },
    { timeMs:23552, ...leftDefaults },
    { timeMs:24937, lasts:800, ...rightDefaults },
    { timeMs:27619, ...leftDefaults },
    { timeMs:29040, ...rightDefaults },
    { timeMs:30411, lasts:600, ...leftDefaults },
    { timeMs:31847, ...rightDefaults },
    { timeMs:32498, ...leftDefaults },
    { timeMs:33279, ...rightDefaults },
    { timeMs:33816, ...leftDefaults },
    { timeMs:34583, ...rightDefaults },
    { timeMs:35158, ...leftDefaults },
    { timeMs:35954, ...rightDefaults },
    { timeMs:36558, ...leftDefaults },
    { timeMs:37301, ...rightDefaults },
    { timeMs:37947, ...leftDefaults },
    { timeMs:38646, ...rightDefaults },
    { timeMs:39279, ...leftDefaults },
    { timeMs:39983, ...rightDefaults },
    { timeMs:40723, ...leftDefaults },
    { timeMs:41429, ...rightDefaults },
    { timeMs:42093, ...leftDefaults },
    { timeMs:42793, ...rightDefaults },
    { timeMs:43496, ...leftDefaults },
    { timeMs:44182, ...rightDefaults },
    { timeMs:44868, ...leftDefaults },
    { timeMs:45547, ...rightDefaults },
    { timeMs:46251, ...leftDefaults },
    { timeMs:46947, ...rightDefaults },
    { timeMs:47682, ...leftDefaults },
    { timeMs:48347, ...rightDefaults },
    { timeMs:49047, ...leftDefaults },
    { timeMs:49789, ...rightDefaults },
    { timeMs:50444, ...leftDefaults },
    { timeMs:51108, ...rightDefaults },
    { timeMs:51749, ...leftDefaults },
    { timeMs:52453, ...rightDefaults },
    { timeMs:53169, ...leftDefaults },
    { timeMs:53873, ...rightDefaults },
    { timeMs:54583, ...leftDefaults },
    { timeMs:55274, ...rightDefaults },
    { timeMs:67681, ...leftDefaults },
    { timeMs:69084, ...rightDefaults },
    { timeMs:70450, ...leftDefaults },
    { timeMs:71809, ...rightDefaults },
    { timeMs:73171, ...leftDefaults },
    { timeMs:74531, ...rightDefaults },
    { timeMs:75932, ...leftDefaults },
    { timeMs:77353, ...rightDefaults },
    { timeMs:78730, ...leftDefaults },
    { timeMs:78962, ...rightDefaults },
    { timeMs:79106, ...leftDefaults },
    { timeMs:79280, ...rightDefaults },
    { timeMs:79615, ...leftDefaults },
    { timeMs:80048, ...rightDefaults },
    { timeMs:80224, ...leftDefaults },
    { timeMs:80387, ...rightDefaults },
    { timeMs:80566, ...leftDefaults },
    { timeMs:80932, ...rightDefaults },
    { timeMs:81478, ...leftDefaults },
    { timeMs:81766, ...rightDefaults },
    { timeMs:81923, ...leftDefaults },
    { timeMs:82123, ...rightDefaults },
    { timeMs:82407, ...leftDefaults },
    { timeMs:82821, ...rightDefaults },
    { timeMs:82969, ...leftDefaults },
    { timeMs:83148, ...rightDefaults },
    { timeMs:83360, ...leftDefaults },
    { timeMs:83781, ...rightDefaults },
    { timeMs:84203, ...leftDefaults },
    { timeMs:84378, ...rightDefaults },
    { timeMs:84540, ...leftDefaults },
    { timeMs:84721, ...rightDefaults },
    { timeMs:85151, ...leftDefaults },
    { timeMs:85646, ...rightDefaults },
    { timeMs:85787, ...leftDefaults },
    { timeMs:85960, ...rightDefaults },
    { timeMs:86167, ...leftDefaults },
    { timeMs:86554, ...rightDefaults },
    { timeMs:86844, ...leftDefaults },
    { timeMs:86989, ...rightDefaults },
    { timeMs:87170, ...leftDefaults },
    { timeMs:87311, ...rightDefaults },
    { timeMs:87487, ...leftDefaults },
    { timeMs:87819, ...rightDefaults },
    { timeMs:88197, ...leftDefaults },
    { timeMs:88370, ...rightDefaults },
    { timeMs:88553, ...leftDefaults },
    { timeMs:88694, ...rightDefaults },
    { timeMs:88843, ...leftDefaults },
    { timeMs:89238, ...rightDefaults },
    { timeMs:89762, ...leftDefaults },
    { timeMs:89914, ...rightDefaults },
    { timeMs:90083, ...leftDefaults },
    { timeMs:90299, ...rightDefaults },
    { timeMs:90632, ...leftDefaults },
    { timeMs:91203, ...rightDefaults },
    { timeMs:91353, ...leftDefaults },
    { timeMs:91521, ...rightDefaults },
    { timeMs:91689, ...leftDefaults },
    { timeMs:92041, ...rightDefaults },
    { timeMs:92531, ...leftDefaults },
    { timeMs:92674, ...rightDefaults },
    { timeMs:92850, ...leftDefaults },
    { timeMs:93061, ...rightDefaults },
    { timeMs:93415, ...leftDefaults },
    { timeMs:94015, ...rightDefaults },
    { timeMs:94251, ...leftDefaults },
    { timeMs:94369, ...rightDefaults },
    { timeMs:94766, ...leftDefaults },
    { timeMs:95278, ...rightDefaults },
    { timeMs:95409, ...leftDefaults },
    { timeMs:95590, ...rightDefaults },
    { timeMs:95750, ...leftDefaults },
    { timeMs:96108, ...rightDefaults },
    { timeMs:96586, ...leftDefaults },
    { timeMs:96746, ...rightDefaults },
    { timeMs:96930, ...leftDefaults },
    { timeMs:97123, ...rightDefaults },
    { timeMs:97487, ...leftDefaults },
    { timeMs:97637, ...rightDefaults },
    { timeMs:97813, ...leftDefaults },
    { timeMs:97991, ...rightDefaults },
    { timeMs:98162, ...leftDefaults },
    { timeMs:98362, ...rightDefaults },
    { timeMs:98507, ...leftDefaults },
    { timeMs:99011, ...rightDefaults },
    { timeMs:106365, ...leftDefaults },
    { timeMs:107676, ...rightDefaults },
    { timeMs:109127, ...leftDefaults },
    { timeMs:110423, ...rightDefaults },
    { timeMs:111818, ...leftDefaults },
    { timeMs:113184, ...rightDefaults },
    { timeMs:114581, ...leftDefaults },
    { timeMs:115981, ...rightDefaults },
    { timeMs:117317, ...leftDefaults },
    { timeMs:118709, ...rightDefaults },
  ]

  // bars.forEach( b => b.timeMs -= 8000 )
  // bars.forEach( b => b.timeMs -= 7500 )
  // bars.forEach( b => b.timeMs -= 6200 )
  // bars.forEach( b => b.timeMs -= 6000 )
  bars.forEach( b => b.timeMs -= 5800 )

  return { inOrder:1, name:`Spacer Ranfisza`, bars, audio:rhythmGameAudio.pixelFantasia } satisfies RhythmGameLevel
}

