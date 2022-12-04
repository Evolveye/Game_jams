import Animation from "../Sprite/Animation"
import Sprite from "../Sprite"
import LevelCell from "./LevelCell"
import LevelBeingTemplate from "./LevelBeing"

export type DrawVariant = `normal` | `isometric`
export type Neighbours<T = null | LevelCell> = {
  n:  T
  ne: T
  e:  T
  se: T
  s:  T
  sw: T
  w:  T
  nw: T
}

export type LevelTileConfig = {
  translation?: {x?: number; y?: number}
  directionalSprites?: ((neighbourTiles:Partial<Neighbours<null | LevelTile>>) => void | null | Sprite) | Partial<Neighbours<Sprite | ((neighbourTile:null | LevelTile) => void | null | Sprite)>>
  directionalGroundworkSprites?: ((neighbourTiles:Partial<Neighbours<null | LevelTile>>) => void | null | Sprite) | Partial<Neighbours<Sprite | ((neighbourTile:null | LevelTile) => void | null | Sprite)>>
}

export class LevelTile {
  templateId: string
  x: number
  y: number
  layer: number
  height: number
  animation: Animation
  groundworkAnimation: null | Animation = null
  config: LevelTileConfig

  constructor( templateId:string, x:number, y:number, layer, height:number, sprite:Sprite, config:LevelTileConfig = {} ) {
    this.templateId = templateId
    this.x = x
    this.y = y
    this.layer = layer
    this.height = height
    this.animation = sprite.getAnimation()
    this.config = config
  }

  draw = (ctx:CanvasRenderingContext2D, x:number, y:number, size:number, _variant:DrawVariant) => {
    const { layer } = this

    x = this.x
    y = this.y

    this.animation.draw( ctx,
      x * size,
      y * (size / 2 - 10) - layer * (size / 2 - 10) - (this.config.translation?.y ?? 0),
      size, size,
    )

    // this.groundworkAnimation?.draw( ctx,
    //   x * size + heightTransition,
    //   y * size - heightTransition,
    //   size, size,
    // )
  }

  directionise = (neighbours:Neighbours) => {
    const { directionalSprites = {}, directionalGroundworkSprites = {} } = this.config
    const neighboursCells:Partial<Neighbours<null | LevelTile>> = {}

    Object.entries( neighbours ).forEach( ([ k, v ]) => {
      const tile = v?.getLayer( this.layer, true )

      if (tile && tile.layer < this.layer && tile.layer + tile.height < this.layer) {
        neighboursCells[ k ] = null
      } else {
        neighboursCells[ k ] = tile
      }
    } )

    // const availableDirections = new Set([
    //   ...Object.keys( directionalSprites ) as (keyof Neighbours)[],
    //   ...Object.keys( directionalSprites ) as (keyof Neighbours)[],
    // ])

    if (directionalSprites) {
      let animation

      if (typeof directionalSprites === `function`) animation = directionalSprites( neighboursCells )

      if (animation) this.animation = animation
    }

    if (directionalGroundworkSprites) {
      let sprite:null | Sprite = null

      if (typeof directionalGroundworkSprites === `function`) sprite = directionalGroundworkSprites( neighboursCells ) ?? null

      if (sprite) this.groundworkAnimation = sprite.getAnimation()
    }

    // availableDirections.forEach( direction => {
    // } )

    // availableDirections.forEach( direction => {
    //   const tile = neighboursCells[ direction ]

    //   if (tile && tile.layer < this.layer && tile.layer + tile.height < this.layer) return

    //   const getAnimation = dirObj => {
    //     const dir = dirObj[ typedDirection ]
    //     if (!dir) return
    //     return typeof dir === `function` ? dir( tile )?.getAnimation() : dir.getAnimation()
    //   }

    //   if (directionalSprites && typedDirection in directionalSprites) {
    //     const animation = getAnimation( directionalSprites )
    //     if (animation) this.animation = animation
    //   }

    //   if (directionalGroundworkSprites && typedDirection in directionalGroundworkSprites) {
    //     const groundworkAnimation = getAnimation( directionalGroundworkSprites )
    //     if (groundworkAnimation) this.groundworkAnimation = groundworkAnimation
    //   }
    // } )
  }
}

export class LevelTileTemplate extends LevelBeingTemplate {
  config: LevelTileConfig

  constructor( id:string, sprite:Sprite, config:LevelTileConfig = {} ) {
    super( id, sprite )

    this.config = config
  }

  createTile = (x:number, y:number, layer, height:number) => {
    return new LevelTile( this.id, x, y, layer, height, this.sprite, this.config )
  }
}
