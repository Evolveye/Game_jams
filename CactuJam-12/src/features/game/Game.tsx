import React, { memo, forwardRef } from "react"
import { CSSProperties, cn } from "@lib/theming"
import Image from "@lib/components/Image"
import { Theme, createStylesHook } from "@fet/theming"
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

        <div style={{ minHeight:200 }}>
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
        </div>

        <div style={{ minHeight:200 }}>
          {
            !isMoveControlsUsed ? <h3>Sterowanie?</h3> : (
              <>
                <h3>Sterowanie</h3>
                <dl className={classes.stats}>
                  {
                    allMoveControlsUsed ? (
                      <>
                        <dt>Poruszanie</dt>
                        <dd>W, S, A, D,<br /> ↑, ↓, ←, →</dd>
                      </>
                    ) : [
                      gameData.usedW && <React.Fragment key="KeyW">
                        <dt>Klawisze<br />W, ↑</dt>
                        <dd>Kierunek północy</dd>
                      </React.Fragment>,

                      gameData.usedS && <React.Fragment key="KeyS">
                        <dt>Klawisze<br />S, ↓</dt>
                        <dd>Kierunek południowy</dd>
                      </React.Fragment>,

                      gameData.usedA && <React.Fragment key="KeyA">
                        <dt>Klawisze<br />A, ←</dt>
                        <dd>Kierunek zachodni</dd>
                      </React.Fragment>,

                      gameData.usedD && <React.Fragment key="KeyD">
                        <dt>Klawisze<br />D, →</dt>
                        <dd>Kierunek wschodni</dd>
                      </React.Fragment>,
                    ]
                  }
                </dl>
              </>
            )
          }
        </div>

      </section>

      <Canvases ref={handleCanvasesWrapper} />

      <section className={cn( classes.column, `is-negative` )}>
        <Image className={cn( classes.avatar, classes.frame )} src="#" alt="Opponent avatar" />
      </section>
    </article>
  )
}

const getPseudoElementsBorderProps = (atoms:Theme["atoms"], props:CSSProperties) => ({
  "&::before": {
    content: `""`,
    display: `block`,
    position: `absolute`,
    inset: 0,
    borderWidth: 0,
    borderStyle: `solid`,
    borderColor: atoms.colors.positive + `aa`,
    ...props,
  },

  "&::after": {
    content: `""`,
    display: `block`,
    position: `absolute`,
    inset: 0,
    borderWidth: 0,
    borderStyle: `solid`,
    borderColor: atoms.colors.negative + `aa`,
    ...props,
  },
})

const useStyles = createStylesHook( ({ atoms }) => ({
  game: {
    display: `grid`,
    gridTemplateColumns: `200px 1fr 200px`,
    width: `100%`,
    height: `100dvh`,
  },
  column: {
    padding: atoms.spacing.small,

    "&.is-positive": {
      color: atoms.colors.positive,
    },

    "&.is-negative": {
      color: atoms.colors.positive,
    },
  },

  canvasesWrapper: {
    position: `relative`,

    ...getPseudoElementsBorderProps( atoms, {
      borderLeftWidth: atoms.sizes.border.width,
      borderRightWidth: atoms.sizes.border.width,
    } ),
  },
  canvas: {
    position: `absolute`,
    left: atoms.sizes.border.width,
    top: atoms.sizes.border.width,
    width: `calc( 100% - ${atoms.sizes.border.width}px )`,
    height: `calc( 100% - ${atoms.sizes.border.width}px )`,
  },

  avatar: {
    width: `100%`,
    aspectRatio: 1,
  },

  frame: {
    position: `relative`,

    ...getPseudoElementsBorderProps( atoms, {
      borderWidth: atoms.sizes.border.width,
    } ),
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
