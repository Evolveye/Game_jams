import React, { useEffect, useRef, useState } from "react"
import getWindow from "../../../core/functions/getWindow"
import Player from "../logic/entities/Player"
import Game from "../logic/Game"
import MovingEntity from "../logic/MovingEntity"
import Inventory from "./Inventory"

export type userInterfaceProps = {
  game:Game
}

export default function UserInterface({ game }:userInterfaceProps) {
  const [ , setLastUpdate ] = useState( 0 )
  const intervalIdRef = useRef<number>( null )
  const { activeEntity } = game


  useEffect( () => {
    intervalIdRef.current = getWindow()?.setInterval( () => setLastUpdate( Date.now() ), 100 )
    return () => getWindow()?.clearInterval( intervalIdRef.current )
  } )


  if (!activeEntity) return null


  return (
    <ul style={{ margin:10 }}>
      <li>Klikając "q" podnosisz prezent oraz przekazujesz go do domu</li>
      <li />
      {activeEntity instanceof Player && <li>Punkty: {activeEntity.score}</li>}
      <li>Punkty Mikołaja: {getWindow()?.localStorage.getItem( `santa` ) ?? 0}</li>
      <li>Punkty Mroza: {getWindow()?.localStorage.getItem( `frost` ) ?? 0}</li>
      <li />
      {activeEntity instanceof MovingEntity && <li>Zawartość kieszeni: <Inventory items={activeEntity.getInventory()} /> </li>}
    </ul>
  )
}
