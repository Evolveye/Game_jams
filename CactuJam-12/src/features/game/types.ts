export type GameColors = {
  safe: string
  danger: string
}

export type SemanticColor = `land` | `land-50`
export type SemanticPosition = number | `width` | `height`
export type Point = {
  color?: SemanticColor
  x: SemanticPosition
  y: SemanticPosition
}
export type Line = {
  color?: SemanticColor
  from: Omit<Point, "color">
  to: Omit<Point, "color">
}
export type Rect = {
  color?: SemanticColor
  x: SemanticPosition
  y: SemanticPosition
  w: SemanticPosition
  h: SemanticPosition
}
