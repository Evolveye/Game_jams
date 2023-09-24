import React, { memo, forwardRef } from "react"
import { cn } from "@lib/theming"
import Image from "@lib/components/Image"
import { createStylesHook } from "@fet/theming"
import CJ12Game from "./logic/game"
import { useGame } from "./logic/controller"

type Canvasprops = {}

const Canvases = memo( forwardRef<HTMLDivElement, Canvasprops>( (props, ref) => {
  const [ classes ] = useStyles()

  return (
    <section ref={ref} className={classes.canvasesWrapper}>
      <canvas className={classes.canvas} />
    </section>
  )
} ) )

export default function CactuJam12Game() {
  const [ classes, { atoms } ] = useStyles()
  const [ handleCanvasesWrapper, gameData ] = useGame<CJ12Game, HTMLDivElement>( div => new CJ12Game( div, {
    colors: {
      safe: atoms.colors.positive,
      danger: atoms.colors.negative,
    },
  } ) )

  const isMoveControlsUsed = gameData.usedW || gameData.usedS || gameData.usedA || gameData.usedD
  const allMoveControlsUsed = gameData.usedW && gameData.usedS && gameData.usedA && gameData.usedD

  return (
    <article className={classes.game}>
      <section className={cn( classes.column, `is-positive` )}>
        <Image className={cn( classes.avatar, classes.frame )} src="#" alt="Player's avatar" />

        {
          !gameData.closedAreas ? <h3>Statystyki?</h3> : (
            <>
              <h3>Statystyki</h3>
              <dl className={classes.stats}>
                <dt>Zbadanych terenów</dt>
                <dd>{gameData.closedAreas}</dd>
              </dl>
            </>
          )
        }

        {
          !isMoveControlsUsed ? <h3>Sterowanie?</h3> : (
            <>
              <h3>Sterowanie</h3>
              <dl className={classes.stats}>
                {
                  allMoveControlsUsed ? (
                    <>
                      <dt>Poruszanie się:</dt>
                      <dd>Klawisze W, S, A, D</dd>
                    </>
                  ) : [
                    gameData.usedW && <React.Fragment key="KeyW">
                      <dt>Klawisz W</dt>
                      <dd>Kierunek północy</dd>
                    </React.Fragment>,

                    gameData.usedS && <React.Fragment key="KeyS">
                      <dt>Klawisz S</dt>
                      <dd>Kierunek południowy</dd>
                    </React.Fragment>,

                    gameData.usedA && <React.Fragment key="KeyA">
                      <dt>Klawisz A</dt>
                      <dd>Kierunek zachodni</dd>
                    </React.Fragment>,

                    gameData.usedD && <React.Fragment key="KeyD">
                      <dt>Klawisz D</dt>
                      <dd>Kierunek wschodni</dd>
                    </React.Fragment>,
                  ]
                }
              </dl>
            </>
          )
        }
      </section>

      <Canvases ref={handleCanvasesWrapper} />

      <section className={cn( classes.column, `is-negative` )}>
        <Image className={cn( classes.avatar, classes.frame )} src="#" alt="Opponent avatar" />
      </section>
    </article>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  game: {
    display: `grid`,
    gridTemplateColumns: `200px 1fr 200px`,
    width: `100%`,
    height: `100dvh`,
  },
  column: {
    padding: atoms.spacing.main,

    "&.is-positive": {
      color: atoms.colors.positive,
    },

    "&.is-negative": {
      color: atoms.colors.positive,
    },
  },

  canvasesWrapper: {
    position: `relative`,
  },
  canvas: {
    position: `absolute`,
    left: 0,
    top: 0,
    width: `100%`,
    height: `100%`,
  },

  avatar: {
    width: `100%`,
    aspectRatio: 1,
  },

  frame: {
    position: `relative`,

    "&::before": {
      content: `""`,
      display: `block`,
      position: `absolute`,
      inset: 0,
      border: `${atoms.sizes.border.width}px solid ${atoms.colors.positive}`,
    },

    "&::after": {
      content: `""`,
      display: `block`,
      position: `absolute`,
      inset: 0,
      border: `${atoms.sizes.border.width}px solid ${atoms.colors.negative}aa`,
    },
  },

  stats: {
    display: `grid`,
    gridTemplateColumns: `1fr 1fr`,
    gap: atoms.spacing.main,

    "& > dt": {
      textAlign: `right`,
    },

    "& > dd": {
      textAlign: `left`,
      margin: 0,
    },
  },
}) )
