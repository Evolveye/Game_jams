type GameUi = {
  root: HTMLDivElement
  canvas: HTMLCanvasElement
}

export default class Game {
  ui: GameUi

  constructor( gameRootElement:HTMLDivElement ) {
    this.ui = this.constructUi( gameRootElement )
  }

  constructUi( root:HTMLDivElement ) {
    return {
      root,
      canvas: document.querySelector( `canvas` ) as HTMLCanvasElement,
    } as GameUi
  }
}
