"use client"

import { useUiManager } from "@/lib/dynamicUi"
import CactuJam13Game from "./logic"
import classes from "./CactuJam13.module.css"

export default function CactuJam13() {
  const [ handleRef, game ] = useUiManager<HTMLDivElement, CactuJam13Game>( rootElement => new CactuJam13Game( rootElement ) )

  return (
    <div ref={handleRef} className={classes.game}>
      <canvas className={classes.canvas} />
    </div>
  )
}
