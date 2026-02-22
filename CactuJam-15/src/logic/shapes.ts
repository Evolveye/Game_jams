export class Rect {
  constructor(
    public x:number,
    public y:number,
    public width:number,
    public height:number,
  ) {}

  static getCenter( rect:Rect ) {
    return new Point( rect.x + rect.width / 2, rect.y + rect.height / 2 )
  }

  static getCentersDistance( r1:Rect, r2:Rect ) {
    return Point.getDistance( Rect.getCenter( r1 ), Rect.getCenter( r2 ) )
  }

  static getDistance( r1:Rect, r2:Rect ) {
    // Difference on X axis
    // If r1 is on the left for r2: dx = r2.x - (r1.x + r1.width)
    // If r2 is on the left for r1: dx = r1.x - (r2.x + r2.width)
    const dx = Math.max(
      0,
      r2.x - (r1.x + r1.width),
      r1.x - (r2.x + r2.width),
    )

    const dy = Math.max(
      0,
      r2.y - (r1.y + r1.height),
      r1.y - (r2.y + r2.height),
    )

    return Math.hypot( dx, dy )
  }

  static contains( container:Rect, containing:Rect ) {
    return (
      containing.x >= container.x &&
      containing.x + containing.width <= container.x + container.width &&
      containing.y >= container.y &&
      containing.y + containing.height <= container.y + container.height
    )
  }

  static containsPoint( container:Rect, point:Point ) {
    return (
      point.x >= container.x && point.x < container.x + container.width &&
      point.y >= container.y && point.y < container.y + container.height
    )
  }

  static intersects( r1:Rect, r2:Rect ) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    )
  }
}

export class Point {
  constructor(
    public x:number,
    public y:number,
  ) {}

  static getDistance( a:Point, b:Point ) {
    return Math.hypot( a.x - b.x, a.y - b.y )
  }
}
