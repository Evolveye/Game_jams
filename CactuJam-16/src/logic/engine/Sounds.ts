/**
 * - `volume`: from 0 to 1, on top of the master volume
 * - `rate`: playback speed, which also changes the pitch
 * - `rateVariation`: random change of the rate, e.g. `0.1` for ±10%, so repeated sounds are not identical
 */
export type PlayOptions = { volume?:number, rate?:number, rateVariation?:number }

/** A sound being played, which can be stopped early, e.g. a line cut off by the next one. */
export type SoundHandle = { stop:() => void }

/** The music playing now: its file, and its own volume to fade it in and out. */
type MusicTrack = { source:string, gain:GainNode, node:null | AudioBufferSourceNode }

/** Seconds a song takes to fade in, or out when another one takes over. */
const MUSIC_FADE = 0.6

/**
 * Plays short sounds and looping music (Web Audio). Files are loaded on first use and kept.
 * Browsers allow sound only after the player interacts with the page: short sounds asked for before that are skipped,
 * music waits and starts then.
 */
export default class Sounds {
  #ctx = new AudioContext()
  #master = this.#ctx.createGain()
  /** Music has its own volume, under the master one. */
  #musicBus = this.#ctx.createGain()
  #buffers = new Map<string, Promise<null | AudioBuffer>>()
  #isUnlocked = false
  #music: null | MusicTrack = null

  constructor() {
    this.#master.connect( this.#ctx.destination )
    this.#musicBus.connect( this.#master )
    this.#musicBus.gain.value = 0.5

    // Any key or click counts; the context is also resumed after the browser suspends it (e.g. a hidden tab).
    const unlock = () => {
      const wasLocked = !this.#isUnlocked

      this.#isUnlocked = true
      if (this.#ctx.state === `suspended`) this.#ctx.resume()

      // Music asked for before the first interaction starts now.
      if (wasLocked && this.#music) this.#startMusic( this.#music )
    }

    window.addEventListener( `keydown`, unlock )
    window.addEventListener( `pointerdown`, unlock )
  }

  /** Master volume, from 0 to 1. */
  get volume() {
    return this.#master.gain.value
  }

  set volume( volume:number ) {
    this.#master.gain.value = volume
  }

  /** Music volume, from 0 to 1, on top of the master volume. */
  get musicVolume() {
    return this.#musicBus.gain.value
  }

  set musicVolume( volume:number ) {
    this.#musicBus.gain.value = volume
  }

  /** Loads sounds ahead, so their first play starts without a delay. */
  preload( ...sources:string[] ) {
    return Promise.all( sources.map( source => this.#load( source ) ) )
  }

  play( source:string, { volume = 1, rate = 1, rateVariation = 0 }:PlayOptions = {} ): SoundHandle {
    let node: null | AudioBufferSourceNode = null
    let isStopped = !this.#isUnlocked

    this.#load( source ).then( buffer => {
      if (!buffer || isStopped) return

      const gain = this.#ctx.createGain()

      node = this.#ctx.createBufferSource()
      node.buffer = buffer
      node.playbackRate.value = rate * (1 + (Math.random() * 2 - 1) * rateVariation)
      gain.gain.value = volume

      node.connect( gain ).connect( this.#master )
      node.start()
    } )

    return {
      stop: () => {
        isStopped = true
        node?.stop()
      },
    }
  }

  /**
   * Plays a song in a loop, fading out the one playing before. The song already playing just goes on,
   * so screens sharing a song can each ask for it.
   */
  playMusic( source:string ) {
    if (this.#music?.source === source) return

    this.stopMusic()

    const gain = this.#ctx.createGain()

    gain.connect( this.#musicBus )
    this.#music = { source, gain, node:null }
    if (this.#isUnlocked) this.#startMusic( this.#music )
  }

  /** Fades the music out (over `seconds`) and stops it. */
  stopMusic( seconds = MUSIC_FADE ) {
    const music = this.#music
    if (!music) return

    const now = this.#ctx.currentTime

    this.#music = null
    music.gain.gain.cancelScheduledValues( now )
    music.gain.gain.setValueAtTime( music.gain.gain.value, now )
    music.gain.gain.linearRampToValueAtTime( 0, now + seconds )
    music.node?.stop( now + seconds )
  }

  /** Starts the song looping from its beginning, fading in. Skipped when another song took over while it loaded. */
  #startMusic( music:MusicTrack ) {
    this.#load( music.source ).then( buffer => {
      if (!buffer || this.#music !== music || music.node) return

      const now = this.#ctx.currentTime
      const node = this.#ctx.createBufferSource()

      node.buffer = buffer
      node.loop = true
      node.connect( music.gain )
      music.gain.gain.setValueAtTime( 0, now )
      music.gain.gain.linearRampToValueAtTime( 1, now + MUSIC_FADE )
      node.start()
      music.node = node
    } )
  }

  /** Loads and decodes a file once; `null` when it cannot be played. */
  #load( source:string ) {
    const cachedBuffer = this.#buffers.get( source )
    if (cachedBuffer) return cachedBuffer

    const buffer = fetch( source )
      .then( response => response.arrayBuffer() )
      .then( data => this.#ctx.decodeAudioData( data ) )
      .catch( error => {
        console.warn( `Sound "${source}" cannot be played:`, error )
        return null
      } )

    this.#buffers.set( source, buffer )
    return buffer
  }
}
