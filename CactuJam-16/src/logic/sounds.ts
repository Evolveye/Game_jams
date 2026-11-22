import calmMusic from "../assets/music/calm.wav"
import playgroundMusic from "../assets/music/playground.wav"
import tankMusic from "../assets/music/tank.wav"
import tiptoeMusic from "../assets/music/tiptoe.wav"
import babyCry from "../assets/sounds/baby-cry.wav"
import dayLost from "../assets/sounds/day-lost.wav"
import dayStart from "../assets/sounds/day-start.wav"
import dayWon from "../assets/sounds/day-won.wav"
import kidFled from "../assets/sounds/kid-fled.wav"
import kidHit from "../assets/sounds/kid-hit.wav"
import menuConfirm from "../assets/sounds/menu-confirm.wav"
import menuMove from "../assets/sounds/menu-move.wav"
import momCall from "../assets/sounds/mom-call.wav"
import pickup from "../assets/sounds/pickup.wav"
import playerHit from "../assets/sounds/player-hit.wav"
import storyIntro from "../assets/sounds/story-intro.wav"
import swingSpade from "../assets/sounds/swing-spade.wav"
import swing from "../assets/sounds/swing.wav"
import voiceKid from "../assets/sounds/voice-kid.wav"
import voiceMom from "../assets/sounds/voice-mom.wav"
import voicePlayer from "../assets/sounds/voice-player.wav"
import whoosh from "../assets/sounds/whoosh.wav"

/** Every sound of the game (URLs), so levels, items and speakers pick them by name. */
export const SOUNDS = {
  babyCry,
  dayLost,
  dayStart,
  dayWon,
  kidFled,
  kidHit,
  menuConfirm,
  menuMove,
  momCall,
  pickup,
  playerHit,
  storyIntro,
  swing,
  swingSpade,
  voiceKid,
  voiceMom,
  voicePlayer,
  whoosh,
}

/**
 * Every song (URLs), looped by `Sounds.playMusic`:
 * - `calm`: menus and stories
 * - `playground`: regular days
 * - `tiptoe`: days with babies, where care matters
 * - `tank`: the hardest days at the end
 */
export const MUSIC = {
  calm: calmMusic,
  playground: playgroundMusic,
  tiptoe: tiptoeMusic,
  tank: tankMusic,
}
