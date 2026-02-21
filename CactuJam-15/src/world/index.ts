import { createNoise2D, type NoiseFunction2D } from 'simplex-noise'
import { Rect } from './shapes'
import Quadtree from './Quadtree'
import type Camera from './Camera'

export type WorldConfig = {
  chunkSize: number
  widthInChunks: number
  heightInChunks: number
  maxTerrainDepth: number
  seed: number
}

type WorldColors = Record<string, string>
type ChunkNoiseFn = (node:Quadtree) => number

class Chunk {
  #noise2D: ChunkNoiseFn
  #ctx: CanvasRenderingContext2D
  #needsRedraw: boolean = true
  #offscreenCanvas: HTMLCanvasElement
  #tree: Quadtree
  #colors: WorldColors
  #boundary: Rect

  constructor( boundary:Rect, maxTerrainDepth:number, colors:WorldColors, noiseFn:ChunkNoiseFn ) {
    this.#offscreenCanvas = document.createElement( `canvas` )
    this.#offscreenCanvas.width = boundary.width
    this.#offscreenCanvas.height = boundary.height

    const ctx = this.#offscreenCanvas.getContext( `2d` )
    if (!ctx) throw `guard`

    this.#noise2D = noiseFn
    this.#boundary = boundary
    this.#ctx = ctx
    this.#colors = colors
    this.#tree = this.#buildTerrain( maxTerrainDepth, 0, boundary )
  }

  get boundary() {
    return this.#boundary
  }

  draw( ctx:CanvasRenderingContext2D ) {
    this.#renderOffscreen()

    ctx.drawImage(
      this.#offscreenCanvas,
      this.boundary.x,
      this.boundary.y,
    )
  }

  #buildTerrain( maxTerrainDepth:number, depth:number, boundary:Rect ) {
    const node = new Quadtree( depth, boundary )

    if (depth < maxTerrainDepth) {
      node.subdivide()

      node.division!.northwest = this.#buildTerrain( maxTerrainDepth, depth + 1, node.division!.northwest.boundary )
      node.division!.northeast = this.#buildTerrain( maxTerrainDepth, depth + 1, node.division!.northeast.boundary )
      node.division!.southwest = this.#buildTerrain( maxTerrainDepth, depth + 1, node.division!.southwest.boundary )
      node.division!.southeast = this.#buildTerrain( maxTerrainDepth, depth + 1, node.division!.southeast.boundary )

      node.attemptCollapse()
    } else {
      const elevation = this.#noise2D( node )

      if (elevation > 0.2) node.tags = new Set([ `land` ])
      else if (elevation > 0.1) node.tags = new Set([ `beach` ])
      else node.tags = new Set([ `water` ])
    }

    return node
  }

  #renderOffscreen() {
    if (!this.#needsRedraw) return

    const ctx = this.#ctx
    const boundary = this.#boundary

    ctx.clearRect( 0, 0, boundary.width, boundary.height )

    const drawNode = (node:Quadtree) => {
      if (node.division) {
        drawNode( node.division.northwest )
        drawNode( node.division.northeast )
        drawNode( node.division.southwest )
        drawNode( node.division.southeast )
      } else {
        const relX = node.boundary.x - boundary.x
        const relY = node.boundary.y - boundary.y
        const firstTag = node.tags.values().next().value

        ctx.fillStyle = (firstTag && this.#colors[ firstTag ]) || `#000`
        ctx.fillRect( relX, relY, node.boundary.width + 1, node.boundary.height + 1 )
      }
    }

    drawNode( this.#tree )
    this.#needsRedraw = false
  }
}

export default class World {
  #noise2D: NoiseFunction2D
  #chunks = new Map<string, Chunk>()
  #chunkSize: number
  #width: number
  #height: number
  #maxTerrainDepth: number

  #colors: Record<string, string> = {
    land: `#4a7c44`,  // Green
    beach: `#d2b48c`, // yellow
    water: `#1e90ff`, // Blue
  }

  constructor( config:WorldConfig ) {
    this.#chunkSize = config.chunkSize
    this.#width = config.widthInChunks * config.chunkSize
    this.#height = config.widthInChunks * config.chunkSize
    this.#maxTerrainDepth = config.maxTerrainDepth

    this.#noise2D = createNoise2D( () => {
      let t = config.seed += 0x6D2B79F5
      t = Math.imul( t ^ t >>> 15, t | 1 )
      t ^= t + Math.imul( t ^ t >>> 7, t | 61 )
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    } )

    this.#generateChunks()
  }

  get width() {
    return this.#width
  }

  get height() {
    return this.#height
  }

  #generateChunks() {
    for (let x = 0;  x < this.#width;  x += this.#chunkSize) {
      for (let y = 0;  y < this.#height;  y += this.#chunkSize) {
        const chunk = new Chunk(
          new Rect( x, y, this.#chunkSize, this.#chunkSize ),
          this.#maxTerrainDepth,
          this.#colors,
          node => this.#getTerrainElevation( node ),
        )

        this.#chunks.set( `${x},${y}`, chunk )
      }
    }
  }

  #getTerrainElevation( node:Quadtree ) {
    const centerX = node.boundary.x + node.boundary.width / 2
    const centerY = node.boundary.y + node.boundary.height / 2

    const scale = 0.003
    const e = (this.#noise2D( centerX * scale, centerY * scale ) + 1) / 2

    const dx = (centerX / this.#width) - 0.5
    const dy = (centerY / this.#height) - 0.5
    const dist = Math.sqrt( dx * dx + dy * dy ) * 2.2

    return e - dist
  }

  draw( ctx:CanvasRenderingContext2D, camera:Camera ) {
    for (const chunk of this.#chunks.values()) {
      if (Rect.intersects( chunk.boundary, camera )) {
        chunk.draw( ctx )
      }
    }
  }
}
