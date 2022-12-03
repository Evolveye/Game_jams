import { MutableRefObject, ReactNode, useEffect, useRef, useState } from "react"
import Game from "../logic/Game"

export type GameScreenProps<TGame extends Game<any>> = {
  className?: string
  renderPreGameUI: (preGameUIRef:MutableRefObject<HTMLElement>) => ReactNode
  getGame: (preGameUIRef:HTMLElement) => TGame
  renderGameUI: (game:TGame) => ReactNode
}

export default function GameScreen<TGame extends Game<any>>({ className, renderPreGameUI, getGame, renderGameUI }:GameScreenProps<TGame>) {
  const preGameUIRef = useRef<HTMLElement>( null ) as MutableRefObject<HTMLElement>
  const gameRef = useRef<TGame>()
  const [ , updateView ] = useState( true )

  useEffect( () => {
    if (!preGameUIRef.current) return

    gameRef.current = getGame( preGameUIRef.current )
    gameRef.current.on( `status update`, () => updateView( b => !b ) )
    updateView( b => !b )
  }, [ preGameUIRef.current ] )

  return (
    <article className={className}>
      {renderPreGameUI( preGameUIRef )}
      {gameRef.current && renderGameUI( gameRef.current )}
    </article>
  )
}
