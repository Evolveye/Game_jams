import { createNoise2D, type NoiseFunction2D } from 'simplex-noise'
import { Men, Women } from '../entities/human'
import { Fruit } from '../entities/fruit'
import { Point, Rect } from './shapes'
import Quadtree from './Quadtree'
import type Camera from './Camera'

export type WorldConfig = {
  chunkSize: number
  widthInChunks: number
  heightInChunks: number
  maxTerrainDepth: number
  seed: number
}

export type TerrainDrawData = {
  ctx: CanvasRenderingContext2D
  camera: Camera
}

export type DrawData = {
  ctx: CanvasRenderingContext2D
  camera: Camera
  timeMultiplier: number
  updatePosition: (entityPosBefore:Point, entityAfter:Drawable) => void
}

export type Drawable = {
  tagOn: undefined | string
  boundary: Rect
  collideBoundary?: Rect
  draw: (data:DrawData) => void
}


type WorldColorsTint = string
type WorldColors = Record<string, WorldColorsTint[]>
type ChunkNoiseFn = (node:Quadtree) => number
type NoisesFns = {
  hashCoords: (x:number, y:number) => number
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
  entities = new Set<Drawable>()
  #sizeUnit: number

  constructor( boundary:Rect, maxTerrainDepth:number, colors:WorldColors, sizeUnit:number, noiseFns:NoisesFns ) {
    this.#offscreenCanvas = document.createElement( `canvas` )
    this.#offscreenCanvas.width = boundary.width
    this.#offscreenCanvas.height = boundary.height

    const ctx = this.#offscreenCanvas.getContext( `2d` )
    if (!ctx) throw `guard`

    this.#noiseFns = noiseFns
    this.#boundary = boundary
    this.#ctx = ctx
    this.#colors = colors
    this.#sizeUnit = sizeUnit
    this.#tree = this.#buildTerrain( maxTerrainDepth, 0, boundary )
  }

  get boundary() {
    return this.#boundary
  }

  drawTerrain( drawData:TerrainDrawData ) {
    this.#renderOffscreen()

    drawData.ctx.drawImage(
      this.#offscreenCanvas,
      this.boundary.x,
      this.boundary.y,
      this.boundary.width + 1,
      this.boundary.height + 1,
    )
  }

  draw( drawData:DrawData ) {
    for (const entity of this.entities) {
      entity.draw( drawData )
    }
  }

  getTileAt( x:number, y:number ) {
    return this.#findTagInTree( this.#tree, x, y )
  }

  despawn( entity:Drawable ) {
    this.entities.delete( entity )
  }

  spawn( entity:Drawable ) {
    this.entities.add( entity )
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
      const nodeCenter = Rect.getCenter( node.boundary )
      let tag = ``

      if (elevation > 0.15) { // land
        if (moisture > 0.6) {
          tag = `jungle`
          if (spawnChance > 0.999) this.entities.add( new Fruit( nodeCenter.x, nodeCenter.y, tag ) )
        } else if (moisture > 0.3) {
          tag = `forest`
          if (spawnChance > 0.9995) this.entities.add( new Fruit( nodeCenter.x, nodeCenter.y, tag ) )
        } else {
          tag = `desert`
        }
      } else if (elevation > 0.05) { // Beach
        tag = `beach`
      } else { // Water
        tag = `water`
      }

      node.tags = new Set([ tag ])

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
    jungle: [ `#3e6c37` ], // Dark green
    forest: [ `#4a7c44`, `#4b7d44` ], // Green
    desert: [ `#d2b48c`, `#d3b98c` ], // Dark yellow
    beach: [ `#f3e5ab`, `#f8e6ab` ], // Light yellow
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

  draw( drawData:DrawData ) {
    const visibleChunks = new Set<Chunk>()

    for (const chunk of this.#chunks.values()) {
      if (drawData.camera.intersects( chunk.boundary )) {
        chunk.drawTerrain( drawData )
        visibleChunks.add( chunk )
      }
    }

    for (const chunk of visibleChunks) {
      chunk.draw( drawData )
    }
  }

  findEntityNear<T extends Drawable>( x:number, y:number, cb:(entity:Drawable) => boolean ): T | undefined
  findEntityNear<T extends Drawable>( x:number, y:number, radius:number, cb:(entity:Drawable) => boolean ): T | undefined
  findEntityNear( x:number, y:number, radiusOrCb:number | ((entity:Drawable) => boolean), maybeCb?:(entity:Drawable) => boolean ) {
    const [ radius, cb ] = typeof radiusOrCb === `number` ? [ radiusOrCb, maybeCb! ] : [ 0, radiusOrCb ]

    const startCx = Math.floor( x / this.#chunkSize ) * this.#chunkSize
    const startCy = Math.floor( y / this.#chunkSize ) * this.#chunkSize

    for (let ring = 0;  ring <= radius;  ring++) {
      const found = this.#searchRing( startCx, startCy, ring, cb )
      if (found) return found
    }

    return undefined
  }

  #searchRing( cx:number, cy:number, ring:number, cb:(entity:Drawable) => boolean ) {
    if (ring === 0) return this.#checkChunk( cx, cy, cb )

    const minX = cx - ring * this.#chunkSize
    const maxX = cx + ring * this.#chunkSize
    const minY = cy - ring * this.#chunkSize
    const maxY = cy + ring * this.#chunkSize

    for (let x = minX;  x <= maxX;  x += this.#chunkSize) {
      const top = this.#checkChunk( x, minY, cb )
      if (top) return top

      const bottom = this.#checkChunk( x, maxY, cb )
      if (bottom) return bottom
    }

    for (let y = minY + this.#chunkSize;  y < maxY;  y += this.#chunkSize) {
      const left = this.#checkChunk( minX, y, cb )
      if (left) return left

      const right = this.#checkChunk( maxX, y, cb )
      if (right) return right
    }

    return undefined
  }

  #checkChunk( cx:number, cy:number, cb:(entity:Drawable) => boolean ) {
    const chunk = this.#chunks.get( `${cx},${cy}` )
    if (!chunk) return undefined

    for (const entity of chunk.entities) {
      if (cb( entity )) return entity
    }

    return undefined
  }

  #getChunkAt( x:number, y:number ) {
    const cx = Math.floor( x / this.#chunkSize ) * this.#chunkSize
    const cy = Math.floor( y / this.#chunkSize ) * this.#chunkSize
    return this.#chunks.get( `${cx},${cy}` )
  }

  #generateChunks() {
    const sizeUnit = Quadtree.getNodeSize( this.chunkSize, this.maxTerrainDepth )

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
      return h - Math.floor( h )
    }

    for (let x = 0;  x < this.#width;  x += this.#chunkSize) {
      for (let y = 0;  y < this.#height;  y += this.#chunkSize) {
        const chunk = new Chunk(
          new Rect( x, y, this.#chunkSize, this.#chunkSize ),
          this.#maxTerrainDepth,
          this.#colors,
          Quadtree.getNodeSize( this.chunkSize, this.maxTerrainDepth ),
          {
            hashCoords,
            terrain: node => getTerrainElevation( node ),
            biome: node => getMoisture( node ),
          },
        )

        this.#chunks.set( `${x},${y}`, chunk )
      }
    }

    const getSpawnArea = (x:number, y:number, cb:( x:number, y:number, chunk:Chunk, tag:string) => void) => {
      const cx = this.#width / 2 + x
      const cy = this.#height / 2 + y

      const chunk = this.#getChunkAt( cx, cy )
      if (!chunk) throw new Error( `Missing chunk` )

      const tag = chunk?.getTileAt( cx, cy )
      if (!tag) throw new Error( `Missing chunk tag` )

      cb( cx, cy, chunk, tag )
    }

    getSpawnArea( 0, 0, (x, y, chunk, tag) => chunk.spawn( new Men( x, y, sizeUnit, tag ) ) )
    getSpawnArea( 100, 0, (x, y, chunk, tag) => chunk.spawn( new Men( x, y, sizeUnit, tag ) ) )
    getSpawnArea( 50, 100, (x, y, chunk, tag) => chunk.spawn( new Women( x, y, sizeUnit, tag ) ) )
  }

  moveEntity = (entityPosBefore:Point, entityAfter:Drawable) => {
    const entityCenter = Rect.getCenter( entityAfter.collideBoundary ?? entityAfter.boundary )

    const chunkBefore = this.#getChunkAt( entityPosBefore.x, entityPosBefore.y )
    const chunkAfter = this.#getChunkAt( entityCenter.x, entityCenter.y )

    if (chunkAfter) {
      if (chunkBefore && chunkBefore !== chunkAfter) {
        chunkBefore.despawn( entityAfter )
        chunkAfter.spawn( entityAfter )
      }

      entityAfter.tagOn = chunkAfter.getTileAt( entityCenter.x, entityCenter.y )
    }
  }
}
