import React, { useEffect, useRef, useState } from "react"
import * as classes from "./game.module.css"
import GameCore from "./logic/Game"
import pathImgSrc from "./img/path.png"
import pacmanImgSrc from "./img/player.png"
import Entity from "./logic/Entity"
import MovingEntity from "./logic/MovingEntity"
import { ThingInInventory } from "./logic/Inventory"

export type EntityData = {
  x: number
  y: number
  inventory?: ThingInInventory[]
}

const imagesSrcs = {
  path: pathImgSrc,
  pacman: pacmanImgSrc,
}

export default function Game() {
  const game = useRef( null )
  const [ , setLastUpdate ] = useState( 0 )
  const intervalIdRef = useRef<number>( null )
  const entityRef = useRef<null | Entity | MovingEntity>( null )

  const handleCanvasRef = c => {
    if (!c) return

    game.current = new GameCore( c, e => entityRef.current = e )
  }

  let entityData:(null | EntityData) = null

  if (entityRef.current) {
    const e = entityRef.current
    const tilePos = e.getTilePos()

    entityData = {
      x: tilePos.x,
      y: tilePos.y,
    }

    if (e instanceof MovingEntity) {
      entityData = {
        ...entityData,
        inventory: e.getInventory(),
      }

    }
  }


  useEffect( () => game.current.close )
  useEffect( () => {
    intervalIdRef.current = setInterval( () => setLastUpdate( Date.now() ), 500 )
    return () => clearInterval( intervalIdRef.current )
  } )


  return (
    <article className={classes.game}>
      <canvas className={classes.mainCanvas} ref={handleCanvasRef} />

      {
        entityData && (
          <ul>
            {
              entityData.inventory && (
                <li>inventory: {
                  entityData.inventory.map( ({ count, name }) => (
                    <span key={name}>{name}: {count}</span>
                  ) )
                }</li>
              )
            }
            <li>x: {entityData.x}</li>
            <li>y: {entityData.y}</li>
          </ul>
        )
      }
    </article>
  )
}
