import React, { useEffect, useRef, useState } from "react"
import Trigger from "../components/Trigger"
import composePage from "../core/functions/composePage"
import MainLayout from "../core/layouts/main"

function Stach() {
  const [ width, setWidth ] = useState( 0 )

  const onProgress = v => setWidth( v )
  const onFinish = v => {}

  return (
    <>
      <Trigger type="staś" max={100} onProgress={onProgress} onFinish={onFinish} increment={4}>Trzymaj</Trigger>
      <div style={{ height:10, width, backgroundColor:`red` }} />
    </>
  )
}

export default composePage({
  component: Stach,
  layout: MainLayout,
})
