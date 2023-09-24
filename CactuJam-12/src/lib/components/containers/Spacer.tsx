export type SpacerProps = {
  height?: number
}

export default function Spacer({ height = 100 }:SpacerProps) {
  return <div style={{ height }} />
}
