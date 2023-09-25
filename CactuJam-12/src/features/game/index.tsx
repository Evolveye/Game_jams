import { useState } from "react"
import { cn } from "@lib/theming"
import GameUi from "./GameUI"
import GameStartScreen from "./GameStartScreen"

export type GameProps = {
  className?: string
}

export default function CactuJam12Game({ className }:GameProps) {
  const [ started, setStarted ] = useState( false )

  const handleStart = () => setStarted( true )

  return (
    <div className={cn( className )}>
      {started ? <GameUi /> : <GameStartScreen onStartClick={handleStart} />}
    </div>
  )
}
