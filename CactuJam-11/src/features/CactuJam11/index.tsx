import { useEffect, useState } from "react"
import { GameScreen } from "@lib/gameEngine"
import getWindow from "@lib/core/functions/getWindow"
import { createStylesHook } from "@fet/theming"
import GameStatus from "./logic/Status"
import CactuJam11Game from "./logic"
import * as screens from "./Screens"
import { GameContextProvider } from "./GameContext"

export default function CactuJam11() {
  const [ classes ] = useStlyes()
  const [ savedScore, setSavedScore ] = useState<null | Record<string, number>>( null )

  useEffect( () => {
    const storage = getWindow()?.localStorage

    if (!storage) return

    setSavedScore( JSON.parse( storage.getItem( CactuJam11Game.storageScoreKey ) ?? `null` ) )
  }, [] )

  return (
    <GameScreen<CactuJam11Game>
      className={classes.cactuJam11}
      getGame={preGameUIRef => new CactuJam11Game( preGameUIRef )}
      renderPreGameUI={
        preGameUIRef => (
          <section ref={preGameUIRef}>
            <ul data-stats="" className={classes.stats} style={{ display:`none` }}>
              <li>Data wyprawy: <output data-stats-date="" /></li>
              <li>Pora roku: <output data-stats-season="" /></li>
              <li>Punkty: <output data-stats-score="" /></li>
              {savedScore && <li>Najlepszy wynik: <span>{savedScore.maxScore}</span></li>}
            </ul>

            <canvas data-canvas-main="" className={classes.canvas} />
          </section>
        )
      }
      renderGameUI={
        game => {
          // console.log( game )

          return (
            <section>
              <GameContextProvider game={game}>
                {game.state === GameStatus.NOT_STARTED && <screens.StartScreen />}
                {game.state === GameStatus.GAME_OVER && <screens.GameOverScreen distance={game.distance} score={game.score} />}
              </GameContextProvider>
            </section>
          )
        }
      }
    />
  )
}

const useStlyes = createStylesHook( ({ atoms }) => ({
  cactuJam11: {
    position: `relative`,
    height: `100%`,
    fontFamily: `monospace`,

    "& strong": {
      color: `gold`,
    },
  },

  stats: {
    position: `absolute`,
    display: `flex`,
    flexDirection: `column`,
    gap: atoms.spacing.main,
    margin: 0,
    padding: atoms.spacing.main,
    listStyle: `none`,
  },

  canvas: {
    position: `absolute`,
    width: `100%`,
    height: `100%`,
  },
}) )
