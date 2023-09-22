import CactuJam12Game from "@fet/features/game/game"
import { useGame } from "@fet/features/game/controller"

export default function HomePage() {
  const [ handleUi ] = useGame( div => new CactuJam12Game( div ) )

  return (
    <div ref={handleUi}>
      <canvas />
    </div>
  )
}
