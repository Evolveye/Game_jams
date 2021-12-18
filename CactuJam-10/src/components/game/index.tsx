import React, { useEffect, useRef } from "react"
import * as classes from "./game.module.css"
import GameCore from "./logic/Game"
import pathImgSrc from "./img/path.png"
import pacmanImgSrc from "./img/player.png"

const imagesSrcs = {
  path: pathImgSrc,
  pacman: pacmanImgSrc,
}

export default function Game() {
  const game = useRef( null )

  const handleCanvasRef = c => {
    game.current = new GameCore( c, imagesSrcs )
  }

  useEffect( () => game.current.close )

  return (
    <article className={classes.game}>
      <canvas className={classes.mainCanvas} ref={handleCanvasRef} />
    </article>
  )
}
