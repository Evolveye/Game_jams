/** Current and maximum health, for views. */
export type HealthData = { current:number, max:number }

/** Health points of an entity. Composed into entities, e.g. `health = new Health( 3 )`. */
export default class Health {
  max: number
  current: number
  /** Seconds since the last damage or healing, e.g. for showing a bar for a while after a hit. */
  secondsSinceChange = Infinity
  /** Something the view shows has changed since the last `getChangedData()`. */
  #hasChanges = true

  constructor( max:number ) {
    this.max = max
    this.current = max
  }

  get isEmpty() {
    return this.current <= 0
  }

  damage( amount:number ) {
    this.#setCurrent( this.current - amount )
  }

  heal( amount:number ) {
    this.#setCurrent( this.current + amount )
  }

  /** Back to full health, e.g. at the start of a day. */
  fill() {
    this.#setCurrent( this.max )
  }

  update( seconds:number ) {
    this.secondsSinceChange += seconds
  }

  /** Data for the health view, or `null` when nothing changed since the last call. */
  getChangedData() {
    if (!this.#hasChanges) return null

    this.#hasChanges = false
    return this.getData()
  }

  /** Data for the health view. */
  getData(): HealthData {
    return { current:this.current, max:this.max }
  }

  /** Keeps the value between 0 and max, and notes the change. */
  #setCurrent( value:number ) {
    const clampedValue = Math.min( Math.max( value, 0 ), this.max )
    if (clampedValue === this.current) return

    this.current = clampedValue
    this.secondsSinceChange = 0
    this.#hasChanges = true
  }
}
