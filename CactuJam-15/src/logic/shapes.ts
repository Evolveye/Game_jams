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

  static contains( container:Rect, containing:Rect ): boolean {
    return (
      containing.x >= container.x && containing.x < container.x + container.width &&
      containing.y >= container.y && containing.y < container.y + container.height
    )
  }

  static intersects( a:Rect, b:Rect ): boolean {
    return !(
      b.x > a.x + a.width ||
      b.x + b.width < a.x ||
      b.y > a.y + a.height ||
      b.y + b.height < a.y
    )
  }
}

export class Point {
  constructor(
    public x:number,
    public y:number,
  ) {}
}
