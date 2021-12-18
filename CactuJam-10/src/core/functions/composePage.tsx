import React from "react"

export default function composePage({ component:Component, layout:Layout }) {
  return () => <Layout><Component /></Layout>
}
