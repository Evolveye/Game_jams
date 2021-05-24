

export default class Effect {
  /**
   * @param {number} type
   * @param {number} value
   */
  constructor( type, value ) {
    this.type = type
    this.value = value
  }


  static EFFECTS = {
    BLIND: 0,
    ROCK: 1,
    SPEED: 2,
  }
}
