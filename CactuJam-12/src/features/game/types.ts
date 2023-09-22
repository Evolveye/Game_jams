export type GameColors = {
  safe: string
  danger: string
}

export type SemanticColor = `land` | `land-50`

export const isPoint = (item:{}): item is Point => `x` in item && `y` in item
export type Point = {
  color?: SemanticColor
  x: number
  y: number
}

export const isLine = (item:{}): item is Line => `from` in item && `to` in item && isPoint( item.from! ) && isPoint( item.to! )
export type Line = {
  color?: SemanticColor
  from: Omit<Point, "color">
  to: Omit<Point, "color">
}
export const isVerticalLine = (item:{}): item is VerticalLine => isPoint( item ) && `h` in item
export type VerticalLine = {
  color?: SemanticColor
  x: number
  y: number
  h: number
}
export const isHorizontalLine = (item:{}): item is HorizontallLine => isPoint( item ) && `w` in item
export type HorizontallLine = {
  color?: SemanticColor
  x: number
  y: number
  w: number
}
export const isRect = (item:{}): item is Rect => isPoint( item ) && `w` in item && `h` in item
export type Rect = {
  color?: SemanticColor
  x: number
  y: number
  w: number
  h: number
}
