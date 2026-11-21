/**
 * - `volume`: from 0 to 1, on top of the master volume
 * - `rate`: playback speed, which also changes the pitch
 * - `rateVariation`: random change of the rate, e.g. `0.1` for ±10%, so repeated sounds are not identical
 */
export type PlayOptions = { volume?:number, rate?:number, rateVariation?:number }

/** A sound being played, which can be stopped early, e.g. a line cut off by the next one. */
export type SoundHandle = { stop:() => void }

/**
 * Plays short sounds (Web Audio). Files are loaded on first use and kept.
 * Browsers allow sound only after the player interacts with the page, so sounds asked for before that are skipped.
 */
export default class Sounds {
  #ctx = new AudioContext()
  #master = this.#ctx.createGain()
  #buffers = new Map<string, Promise<null | AudioBuffer>>()
  #isUnlocked = false

  constructor() {
    this.#master.connect( this.#ctx.destination )

    // Any key or click counts; the context is also resumed after the browser suspends it (e.g. a hidden tab).
    const unlock = () => {
      this.#isUnlocked = true
      if (this.#ctx.state === `suspended`) this.#ctx.resume()
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
