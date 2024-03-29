const isBrowser = typeof window != `undefined`

class KeysHangler {
  #data = {}
  constructor() {
    if (isBrowser) {
      window.addEventListener( `keydown`, this.onKeyDown )
      window.addEventListener( `keyup`, this.onKeyUp )
    }
  }

  closeEvents() {
    if (isBrowser) {
      window.removeEventListener( `keydown`, this.onKeyDown )
      window.removeEventListener( `keyup`, this.onKeyUp )
    }
  }

  /** @param {KeyboardEvent} param0 */
  onKeyDown = ({ key }) => this.#data[ key ] = true

  /** @param {KeyboardEvent} param0 */
  onKeyUp = ({ key }) => this.#data[ key ] = false

  getkey = keyName => this.#data[ keyName ] ?? false
}

const keyHandler = new KeysHangler()

export default keyHandler
