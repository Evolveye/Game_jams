export type GameColors = {
  safe: string
  danger: string
}

export type SemanticColor = `land` | `player` | `deep land` | `trail` | `danger`

export const isPoint = (item:{}): item is TileShape<Point> => `x` in item && `y` in item
export const isPlayer = (item:{}): item is TileShape<Point> => isPoint( item ) && item.tags.includes( `player` )
export type Point = {
  x: number
  y: number
}

export const isLine = (item:{}): item is TileShape<Line> => `from` in item && `to` in item && isPoint( item.from! ) && isPoint( item.to! )
export type Line = {
  from: Omit<Point, "color">
  to: Omit<Point, "color">
}
export const isVerticalLine = (item:{}): item is TileShape<VerticalLine> => isPoint( item ) && `h` in item
export type VerticalLine = {
  x: number
  y: number
  h: number
}
export const isHorizontalLine = (item:{}): item is TileShape<HorizontallLine> => isPoint( item ) && `w` in item
export type HorizontallLine = {
  x: number
  y: number
  w: number
}
export const isRect = (item:{}): item is Rect => isPoint( item ) && `w` in item && `h` in item
export type Rect = {
  x: number
  y: number
  w: number
  h: number
}


export type TileShape<T> = T & {
  tags: string[]
  color?: SemanticColor
}


export interface TagHolder {
  tags: Set<string>
}
