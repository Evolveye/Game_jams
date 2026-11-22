export type Point = { x:number, y:number }
export type Size = { width:number, height:number }
export type Rect = Point & Size

/** The whole playground in world units (16:9). The renderer scales it to the screen. */
export const WORLD:Rect = { x:0, y:0, width:320, height:180 }

/** The sandbox in the middle of the playground. */
export const SANDBOX:Rect = { x:80, y:40, width:160, height:100 }

/** How far beyond the screen edge kids leave the playground and come onto it, in world units. */
const OFF_SCREEN_MARGIN = 12

/** True when the point lies inside the rectangle. */
export function isPointInside( point:Point, rect:Rect ) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

/** Point just beyond the world's edge nearest to the given one, e.g. where a kid leaves or comes from. */
export function findPointBeyondEdge( point:Point ) {
  const points = [
    { x:WORLD.x - OFF_SCREEN_MARGIN, y:point.y },
    { x:WORLD.x + WORLD.width + OFF_SCREEN_MARGIN, y:point.y },
    { x:point.x, y:WORLD.y - OFF_SCREEN_MARGIN },
    { x:point.x, y:WORLD.y + WORLD.height + OFF_SCREEN_MARGIN },
  ]

  return points.reduce( (nearest, candidate) => {
    const distance = Math.hypot( candidate.x - point.x, candidate.y - point.y )
    const nearestDistance = Math.hypot( nearest.x - point.x, nearest.y - point.y )

    return distance < nearestDistance ? candidate : nearest
  } )
}
