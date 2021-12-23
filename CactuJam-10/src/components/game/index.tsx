import React, { useEffect, useRef } from "react"
import * as classes from "./game.module.css"
import GameCore from "./logic/Game"
import { ThingInInventory } from "./logic/Inventory"
import UserInterface from "./ui/index"


export type EntityData = {
  x: number
  y: number
  inventory?: ThingInInventory[]
}


export default function Game() {
  const gameRef = useRef( new GameCore() )
  const handleCanvasRef1 = c => c && gameRef.current.setCanvas( c, 0 )
  const handleCanvasRef2 = c => c && gameRef.current.setCanvas( c, 1 )


  useEffect( () => gameRef.current.close )


  return (
    <article className={classes.game}>
      <canvas className={classes.mainCanvas} ref={handleCanvasRef1} />
      <canvas className={classes.mainCanvas} ref={handleCanvasRef2} />
      <UserInterface game={gameRef.current} />
    </article>
  )
}
