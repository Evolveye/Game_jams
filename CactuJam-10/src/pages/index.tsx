import { Link } from "gatsby"
import React from "react"
import composePage from "../core/functions/composePage"
import MainLayout from "../core/layouts/main"

function HomePage() {
  return (
    <Link to="/game">Graj</Link>
  )
}

export default composePage({
  component: HomePage,
  layout: MainLayout,
})
