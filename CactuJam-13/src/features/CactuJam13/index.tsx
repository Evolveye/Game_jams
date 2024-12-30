"use client"

import { useUiManager } from "@/lib/dynamicUi"
import CactuJam13Game, { GameState } from "./logic"
import classes from "./CactuJam13.module.css"
import { PlayerEntity } from "./logic/entities/Player"
import cn from "@/lib/core/functions/createClassName"
import Image from "@/lib/core/flow/Image"
import Button from "@/lib/core/controls/Button"
import wait from "@/lib/core/functions/wait"
import homeScreenImg from "./homescreen.png"
import homeScreenPlayerImg from "./homescreen-player.png"
import backgroundTempleImg from "./background-temple.png"
import gameOverScreenImg from "./screen-gameOver.png"
import sounds from "./logic/sounds"
import { doubleJumpImg, widePlatformsImg } from "./logic/entities/Powerups"
import Row from "@/lib/core/flow/Row"

export default function CactuJam13() {
  const [ handleRef, game ] = useUiManager<HTMLDivElement, CactuJam13Game>( rootElement => new CactuJam13Game( rootElement ) )
  const player = game?.camera.lookingAt as undefined | PlayerEntity
  const getDisplayStyle = (...states:GameState[]) => !game || !states.includes( game.state ) ? { visibility:`hidden` as const } : undefined

  const handleHomeToGameplay = async() => {
    if (!game) return

    game.setState( `HOME->GAMEPLAY` )
    await wait( 2 )
    sounds.mayConfused.play()
    await wait( 3 )
    game.setState( `GAMEPLAY` )
  }

  return (
    <article ref={handleRef} className={classes.game} data-state={game?.state}>
      <section className={cn( classes.screen, game?.state === `HOME->GAMEPLAY` && classes.homeToGameplay )} style={getDisplayStyle( `HOME`, `HOME->GAMEPLAY` )}>
        <Image {...homeScreenImg} className={classes.screenBgr} alt="Home screen" />
        <Image {...homeScreenPlayerImg} className={classes.homeScreenPlayer} alt="Home screen player" />

        <nav className={classes.homeScreenNav}>
          <h1>Wielkie Porwanie Majowego Ciasta</h1>

          <Button onClick={() => handleHomeToGameplay()}>START</Button>
        </nav>
      </section>

      <section className={cn( classes.gameplayScreen, classes.screen )} style={getDisplayStyle( `GAMEPLAY` )}>
        <canvas className={classes.canvas} style={{ backgroundImage:`url( ${backgroundTempleImg.src} )` }} />

        <footer className={classes.ui}>
          {
            player && (
              <>
                <div>
                  <p>Najlepszy wynik:</p>
                  <p style={{ textAlign:`right` }}>{game?.higherScore}</p>
                </div>

                <div>
                  <p>Punkty:</p>
                  <p style={{ textAlign:`right` }}>{player.points}</p>
                </div>

                <div>
                  <p>Obecne combo:</p>
                  <p style={{ textAlign:`right` }}>{player.combo}</p>
                </div>

                <div>
                  <p>Najwyższe piętro:</p>
                  <p style={{ textAlign:`right` }}>{player.higherFloor}</p>
                </div>

                <div>
                  <p>Prędkość pogoni:</p>
                  <p style={{ textAlign:`right` }}>{Math.abs( game?.entities.enemies[ 0 ].velocity.y ?? 0 ) * 10}km/h</p>
                </div>

                <div>
                  <p>Modyfikatory:</p>

                  <Row gap="1em">
                    <Image {...widePlatformsImg} width={20} height={20} alt="Wide platforms icon" />
                    {player.powerups.filter( p => p.type === `widePlatforms` ).length}
                  </Row>

                  <Row gap="1em">
                    <Image {...doubleJumpImg} width={20} height={20} alt="Double jump icon" />
                    {player.powerups.filter( p => p.type === `doubleJump` ).length}
                  </Row>
                </div>

                <div>
                  <p>Sterowanie:</p>

                  <br />

                  <p style={{ paddingLeft:15 }}>
                    Poruszanie:<br /> W/S/A/D<br />strzałki<br />spacja
                  </p>

                  <br />

                  <p style={{ paddingLeft:15 }}>
                    Modyfikatory:<br /> klawisze 1/2
                  </p>

                  <br />

                  <p style={{ paddingLeft:15 }}>
                    Restart:<br /> klawisz r
                  </p>
                </div>
              </>
            )
          }
        </footer>
      </section>

      <section className={cn( classes.screen )} style={getDisplayStyle( `GAME-OVER` )}>
        <Image {...gameOverScreenImg} className={classes.screenBgr} alt="Game over screen" />

        <nav className={classes.homeScreenNav}>
          <p>I tak oto, Majowie przygotowali kolejny wypiek składany w ofierze</p>

          <Button onClick={() => game?.setup( true )}>RESTART</Button>
        </nav>
      </section>
    </article>
  )
}
