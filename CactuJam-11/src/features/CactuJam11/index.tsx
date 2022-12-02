import React, { useRef } from "react"

export default function CactuJam11() {
  const canvasRef = useRef( null )

  return <canvas ref={canvasRef} />
}
