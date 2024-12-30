

const sounds = {
  mayConfused: makeAudio( `out/sounds/may-confused.wav` ),
  gameOver1: makeAudio( `out/sounds/game-over-1.wav` ),
  gameOver2: makeAudio( `out/sounds/game-over-2.wav` ),
  jump1: makeAudio( `out/sounds/jump-1.wav` ),
  jump2: makeAudio( `out/sounds/jump-2.wav` ),
  may1: makeAudio( `out/sounds/may-1.wav` ),
  powerup: makeAudio( `out/sounds/powerup.wav` ),
}

export default sounds

function makeAudio( src:string ) {
  if (typeof Audio === `undefined`) return {} as typeof Audio
  const audio = new Audio( src )
  audio.preload = `auto`
  audio.load()
  return audio
}
