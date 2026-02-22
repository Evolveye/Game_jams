import "./normalize.css"
import "./typography.css"
import "./main.css"
import Game from "./Game"

declare global {
  interface Window {
    game: Game
  }
}

window.game = new Game()
