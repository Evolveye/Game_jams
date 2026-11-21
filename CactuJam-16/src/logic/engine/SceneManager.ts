export type Scene = {
  isOverlay?: boolean
  enter?: () => void
  exit?: () => void
  update?: (seconds:number) => void
  draw?: () => void
}

export default class SceneManager {
  #stack: Scene[] = []

  get current() {
    return this.#stack.at( -1 )
  }

  switchTo( scene:Scene ) {
    while (this.#stack.length) this.#stack.pop()?.exit?.()

    this.#stack.push( scene )
    scene.enter?.()
  }

  openOverlay( overlay:Scene ) {
    this.#stack.push( overlay )
    overlay.enter?.()
  }

  closeOverlay() {
    if (this.#stack.length <= 1) return
    this.#stack.pop()?.exit?.()
  }

  update( seconds:number ) {
    this.current?.update?.( seconds )
  }

  draw() {
    let firstVisible = this.#stack.length - 1
    while (firstVisible > 0 && this.#stack[ firstVisible ].isOverlay) firstVisible--

    for (let index = Math.max( 0, firstVisible ); index < this.#stack.length; index++) this.#stack[ index ].draw?.()
  }
}
