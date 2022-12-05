import { useEffect, useState } from "react"
import cn from "@lib/theming/createClassName"
import getWindow from "@lib/core/functions/getWindow"
import { createStylesHook } from "@fet/theming"
import Button from "@fet/controls/Button"
import Text from "@fet/Text"
import { useGameContext } from "./GameContext"

export function StartScreen() {
  const game = useGameContext()
  const [ classes ] = useStyles()
  const [ canStart, setCanStart ] = useState( false )

  useEffect( () => {
    let timeoutId = setTimeout( () => setCanStart( true ), 1000 * 1 )
    return () => { clearTimeout( timeoutId ) }
  }, [] )

  return (
    <section className={cn( classes.screen )}>
      <Text as="h1" body="Wyścig Pana Spinacza z czasem" />
      <Text as="h2" body="CactuJam 11" />
      <Text>
        Pan Spinacz przeżył 10 lat. Ile lat dasz radę Ty przetrwać? <br />
        <s>Spoiler: przetrwanie 2 lat zakrawa o masochizm</s>
      </Text>
      <Text>
        Przygoda rozpoczyna się w spokojnej zimowej krainie, którą zamieszkują istoty takie jak Pan Spinacz. <br />
        To na jak długą przygodę wyrusza zależy od Twoich umiejętności
      </Text>
      <Text>
        Strowanie Za pomocą WSAD lub strzałek. To wszystko. Powodzenia!
      </Text>
      <Button disabled={!canStart} onClick={() => game.start()} body="Rozpocznij grę" />
    </section>
  )
}

export function GameOverScreen({ distance, score }) {
  const [ classes ] = useStyles()
  const [ canStart, setCanStart ] = useState( false )

  useEffect( () => {
    let timeoutId = setTimeout( () => setCanStart( true ), 1000 * 1 )
    return () => { clearTimeout( timeoutId ) }
  }, [] )

  return (
    <section className={cn( classes.screen )}>
      <Text as="h1" body="Wyścig Pana Spinacza zakończony" />
      <Text>
        Przetrwałeś <strong>{distance}</strong> dni.
        Uzyskałeś <strong>{score}</strong> punktów.
      </Text>
      <Button disabled={!canStart} onClick={() => getWindow()?.location.reload()} body="Restart" />
    </section>
  )
}

const useStyles = createStylesHook( ({ atoms }) => ({
  screen: {
    position: `absolute`,
    left: `50%`,
    top: `50%`,
    transform: `translate( -50%, -50% )`,
    width: `max-content`,
    height: `max-content`,
    display: `flex`,
    flexDirection: `column`,
    gap: atoms.spacing.main,
    alignItems: `center`,
    justifyContent: `center`,
    padding: atoms.spacing.main,
    backgroundColor: `#000A`,
    textAlign: `center`,
  },
}) )
