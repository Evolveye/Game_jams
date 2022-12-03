import { GameScreen } from "@lib/gameEngine"
import { createStylesHook } from "@fet/theming"
import GameStatus from "./logic/Status"
import CactuJam11Game from "./logic"
import * as screens from "./Screens"
import { GameContextProvider } from "./GameContext"

export default function CactuJam11() {
  const [ classes ] = useStlyes()

  return (
    <GameScreen<CactuJam11Game>
      className={classes.cactuJam11}
      getGame={preGameUIRef => new CactuJam11Game( preGameUIRef )}
      renderPreGameUI={
        preGameUIRef => (
          <section ref={preGameUIRef}>
            <canvas data-canvas-main="" className={classes.canvas} />
          </section>
        )
      }
      renderGameUI={
        game => {
          console.log( game )

          return (
            <section>
              <GameContextProvider game={game}>
                {game.state === GameStatus.NOT_STARTED && <screens.StartScreen />}
              </GameContextProvider>
            </section>
          )
        }
      }
    />
  )
}

const useStlyes = createStylesHook({
  cactuJam11: {
    position: `relative`,
    height: `100%`,
    fontFamily: `monospace`,
  },

  canvas: {
    position: `absolute`,
    width: `100%`,
    height: `100%`,
  },
})
