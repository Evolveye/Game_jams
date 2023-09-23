import { cn } from "@lib/theming"
import { createStylesHook } from "@fet/theming"
import CactuJam12Game from "@fet/game/game"
import { useGame } from "@fet/game/controller"

export default function HomePage() {
  const [ classes, { atoms } ] = useStyles()
  const [ handleUi ] = useGame( div => new CactuJam12Game( div, {
    colors: {
      safe: atoms.colors.a,
      danger: atoms.colors.b,
    },
  } ) )

  return (
    <div ref={handleUi} className={classes.game}>
      <canvas className={cn( classes.gameWorldCanvas )} />
    </div>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  "@global": {
    body: {
      margin: 0,
      backgroundColor: atoms.colors.background.main,
    },
  },

  game: {
    position: `relative`,
    width: `100%`,
    height: `100dvh`,
  },

  gameWorldCanvas: {
    position: `absolute`,
    left: 0,
    top: 0,
    width: `100%`,
    height: `100%`,
  },
}) )
