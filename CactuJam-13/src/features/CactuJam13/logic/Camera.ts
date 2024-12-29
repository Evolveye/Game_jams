type Point = { x:number, y:number }
type Scene = { width:number, height:number }

export type CameraConfig = {
  lookingAt?: null | Point
}

export default class Camera {
  memoozedPosition = { x:0, y:0 }

  lookingAt: null | Point

  constructor( { lookingAt = null }:CameraConfig = {} ) {
    this.lookingAt = lookingAt
  }

  getLookingAtTranslate( target:Point, scene:Scene, x:number, y:number ) {
    if (!this.lookingAt) return { x, y }

    if (this.lookingAt === target) {
      const cameraOffset = screen.height / 4

      if (y - this.memoozedPosition.y < cameraOffset) {
        this.memoozedPosition.y = y - cameraOffset
      } else if (y - this.memoozedPosition.y > scene.height - cameraOffset) {
        this.memoozedPosition.y = y - (scene.height - cameraOffset)
      }
    }

    return { x, y:y - Math.min( 0, this.memoozedPosition.y ) }
  }
}
