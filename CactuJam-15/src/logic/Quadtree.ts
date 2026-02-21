import { Rect } from "./shapes"

type QuadtreeDivision<T> = {
  northwest: Quadtree<T>
  northeast: Quadtree<T>
  southwest: Quadtree<T>
  southeast: Quadtree<T>
}

export default class Quadtree<T = unknown> {
  static readonly capacity: number = 4

  depth: number
  boundary: Rect
  objects: Rect[] = []
  division?: QuadtreeDivision<T> = undefined
  tags: Set<string> = new Set()

  constructor( depth:number, boundary:Rect ) {
    this.depth = depth
    this.boundary = boundary
  }

  subdivide() {
    const { x, y, width, height } = this.boundary
    const halfW = width / 2
    const halfH = height / 2

    this.division = {
      northwest: new Quadtree( this.depth + 1, new Rect( x, y, halfW, halfH ) ),
      northeast: new Quadtree( this.depth + 1, new Rect( x + halfW, y, halfW, halfH ) ),
      southwest: new Quadtree( this.depth + 1, new Rect( x, y + halfH, halfW, halfH ) ),
      southeast: new Quadtree( this.depth + 1, new Rect( x + halfW, y + halfH, halfW, halfH ) ),
    }

    const oldObjects = [ ...this.objects ]
    this.objects = []
    oldObjects.forEach( o => this.#recursiveInsert( o ) )
  }

  attemptCollapse() {
    const { northwest, northeast, southwest, southeast } = this.division!

    const allSameTag = northwest.tags.size === northeast.tags.size && northwest.tags.isSubsetOf( northeast.tags )
      && northeast.tags.size === southwest.tags.size && northeast.tags.isSubsetOf( southwest.tags )
      && southwest.tags.size === southeast.tags.size && southwest.tags.isSubsetOf( southeast.tags )

    const noObjects =
      northwest.objects.length === 0 && northeast.objects.length === 0 &&
      southwest.objects.length === 0 && southeast.objects.length === 0

    const childrenAreLeafs =
      !northwest.division && !northeast.division &&
      !southwest.division && !southeast.division

    if (allSameTag && noObjects && childrenAreLeafs) {
      this.tags = new Set( northeast.tags )
      this.division = undefined
    } else {
      this.tags = new Set([
        ...northwest.tags, ...northeast.tags,
        ...southwest.tags, ...southeast.tags,
      ])
    }
  }

  #recursiveInsert( rect:Rect ) {
    if (!Rect.contains( this.boundary, rect )) return

    if (!this.division && this.objects.length < Quadtree.capacity) {
      this.objects.push( rect )
      return
    }

    if (!this.division) this.subdivide()
    this.division!.northwest.#recursiveInsert( rect )
    this.division!.northeast.#recursiveInsert( rect )
    this.division!.southwest.#recursiveInsert( rect )
    this.division!.southeast.#recursiveInsert( rect )
  }

  static getNodeSize( size:number, depth:number ) {
    return size >> depth
  }
}
