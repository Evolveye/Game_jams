import React from "react"
import { InventoryItem } from "../logic/Inventory"

export type InventoryProps = {
  items:InventoryItem[]
}

export default function Inventory({ items }:InventoryProps) {
  return (
    <ul>
      {
        items.map( ({ count, name }) => (
          <li key={name} style={{ marginLeft:20 }}>{name}: {count}</li>
        ) )
      }
    </ul>
  )
}
