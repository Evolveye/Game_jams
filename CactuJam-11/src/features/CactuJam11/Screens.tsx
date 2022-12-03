import cn from "@lib/theming/createClassName"
import { createStylesHook } from "@fet/theming"
import Button from "@fet/controls/Button"
import Text from "@fet/Text"
import GameStatus from "./logic/Status"
import { useGameContext } from "./GameContext"

export function StartScreen() {
  const game = useGameContext()
  const [ classes ] = useStyles()

  return (
    <section className={cn( classes.screen )}>
      <Text as="h1" body="Rozpocznij grę" />
      <Button onClick={() => game.changeStatus( GameStatus.STARTED )} body="Start" />
    </section>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  screen: {
    position: `absolute`,
    inset: 0,
    display: `flex`,
    flexDirection: `column`,
    gap: atoms.spacing.main,
    alignItems: `center`,
    justifyContent: `center`,
    height: `100%`,
  },
}) )
