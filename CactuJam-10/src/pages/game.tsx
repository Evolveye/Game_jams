import React from "react"
import Game from "../components/game"
import composePage from "../core/functions/composePage"
import MainLayout from "../core/layouts/main"

function GamePage() {
  return <Game />
}

export default composePage({
  component: GamePage,
  layout: MainLayout,
})
