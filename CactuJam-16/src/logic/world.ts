export type Point = { x:number, y:number }
export type Size = { width:number, height:number }
export type Rect = Point & Size

/** The whole playground in world units (16:9). The renderer scales it to the screen. */
export const WORLD:Rect = { x:0, y:0, width:320, height:180 }

/** The sandbox in the middle of the playground. */
export const SANDBOX:Rect = { x:80, y:40, width:160, height:100 }

/** True when the point lies inside the rectangle. */
export function isPointInside( point:Point, rect:Rect ) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}
