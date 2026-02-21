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

type WorldColorsTint = string
type WorldColors = Record<string, WorldColorsTint[]>
type ChunkNoiseFn = (node:Quadtree) => number
type NoisesFns = {
  hashCoords: (x:number, y:number) => 1 | 0
  terrain: ChunkNoiseFn
  biome: ChunkNoiseFn
}

class Chunk {
  #noiseFns: NoisesFns
  #ctx: CanvasRenderingContext2D
  #needsRedraw: boolean = true
  #offscreenCanvas: HTMLCanvasElement
  #tree: Quadtree
  #colors: WorldColors
  #boundary: Rect

  constructor( boundary:Rect, maxTerrainDepth:number, colors:WorldColors, noiseFns:NoisesFns ) {
    this.#offscreenCanvas = document.createElement( `canvas` )
    this.#offscreenCanvas.width = boundary.width
    this.#offscreenCanvas.height = boundary.height

    const ctx = this.#offscreenCanvas.getContext( `2d` )
    if (!ctx) throw `guard`

    this.#noiseFns = noiseFns
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
      const elevation = this.#noiseFns.terrain( node )
      const moisture = this.#noiseFns.biome( node )
      const spawnChance = this.#noiseFns.hashCoords( node.boundary.x, node.boundary.y )

      if (elevation > 0.15) { // land
        if (moisture > 0.6) {
          node.tags = new Set([ `jungle` ])
          if (spawnChance > 0.7) node.objects.push( new Rect( node.boundary.x, node.boundary.y, 1, 1 ) ) // Dużo owoców
        } else if (moisture > 0.3) {
          node.tags = new Set([ `forest` ])
          if (spawnChance > 0.92) node.objects.push( new Rect( node.boundary.x, node.boundary.y, 1, 1 ) ) // Mało owoców
        } else {
          node.tags = new Set([ `desert` ])
        }
      } else if (elevation > 0.05) { // Beach
        node.tags = new Set([ `beach` ])
      } else { // Water
        node.tags = new Set([ `water` ])
      }

      // TODO: Feature concept
      // const isCenter = Math.abs( node.boundary.x - this.#width / 2 ) < 50 && Math.abs( node.boundary.y - this.#height / 2 ) < 50
      // if (isCenter && elevation > 0.15) {
      //   node.tags.add( `spawn_zone` )
      // }
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
        const tints = !firstTag ? undefined : this.#colors[ firstTag ]
        const color = !tints ? `#000` : tints[ Math.floor( Math.random() * tints.length ) ]

        ctx.fillStyle = color
        ctx.fillRect( relX, relY, node.boundary.width + 1, node.boundary.height + 1 )
      }
    }

    drawNode( this.#tree )
    this.#needsRedraw = false
  }

  getTileAt( x:number, y:number ) {
    return this.#findTagInTree( this.#tree, x, y )
  }

  #findTagInTree( node:Quadtree, x:number, y:number ): string | undefined {
    if (!node.division) return node.tags.values().next().value

    const { x:bx, y:by, width, height } = node.boundary
    const midX = bx + width / 2
    const midY = by + height / 2

    if (x < midX) {
      if (y < midY) return this.#findTagInTree( node.division.northwest, x, y )
      return this.#findTagInTree( node.division.southwest, x, y )
    } else {
      if (y < midY) return this.#findTagInTree( node.division.northeast, x, y )
      return this.#findTagInTree( node.division.southeast, x, y )
    }
  }
}

export default class World {
  #noise2D: NoiseFunction2D
  #chunks = new Map<string, Chunk>()
  #chunkSize: number
  #width: number
  #height: number
  #maxTerrainDepth: number

  #colors: WorldColors = {
    jungle: [ `#1a4314` ], // Dark green
    forest: [ `#4a7c44`, `#4b7d44` ], // Green
    desert: [ `#f3e5ab` ], // Light yellow
    beach: [ `#d2b48c`, `#d3b98c` ], // Yellow
    water: [ `#1e90ff`, `#1e80ff` ], // Blue
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

  get chunkSize() {
    return this.#chunkSize
  }
  get maxTerrainDepth() {
    return this.#maxTerrainDepth
  }

  getTileAt( x:number, y:number ): string | undefined {
    const cx = Math.floor( x / this.#chunkSize ) * this.#chunkSize
    const cy = Math.floor( y / this.#chunkSize ) * this.#chunkSize
    const chunk = this.#chunks.get( `${cx},${cy}` )

    return chunk?.getTileAt( x, y )
  }

  draw( ctx:CanvasRenderingContext2D, camera:Camera ) {
    for (const chunk of this.#chunks.values()) {
      if (camera.intersects( chunk.boundary )) {
        chunk.draw( ctx )
      }
    }
  }

  #generateChunks() {
    const getTerrainElevation = (node:Quadtree) => {
      const center = Rect.getCenter( node.boundary )

      const scale = 0.001
      const e = (this.#noise2D( center.x * scale, center.y * scale ) + 1) / 2

      const dx = (center.x / this.#width) - 0.5
      const dy = (center.y / this.#height) - 0.5
      const dist = Math.sqrt( dx * dx + dy * dy ) * 2.2

      return e - dist
    }

    const getMoisture = (node:Quadtree) => {
      const center = Rect.getCenter( node.boundary )
      const scale = 0.001

      return (this.#noise2D( (center.x + 5000) * scale, (center.y + 5000) * scale ) + 1) / 2
    }

    const hashCoords = (x:number, y:number) => {
      const h = Math.sin( x * 12.9898 + y * 78.233 ) * 43758.5453123
      return (h - Math.floor( h )) as 0 | 1
    }

    for (let x = 0;  x < this.#width;  x += this.#chunkSize) {
      for (let y = 0;  y < this.#height;  y += this.#chunkSize) {
        const chunk = new Chunk(
          new Rect( x, y, this.#chunkSize, this.#chunkSize ),
          this.#maxTerrainDepth,
          this.#colors,
          {
            hashCoords,
            terrain: node => getTerrainElevation( node ),
            biome: node => getMoisture( node ),
          },
        )

        this.#chunks.set( `${x},${y}`, chunk )
      }
    }
  }
}
