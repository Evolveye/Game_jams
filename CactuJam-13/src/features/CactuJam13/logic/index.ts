import { UiManager, UiManagerHolder } from "@/lib/dynamicUi"
import { PlayerEntity } from "./entities/Player"
import Entity from "./entities/Entity"
import { PlatformEntity } from "./entities/Platform"

export default class CactuJam13Game implements UiManagerHolder {
  uiManager: UiManager<HTMLDivElement>
  ctx: CanvasRenderingContext2D

  sizes = {
    width: 0,
    halfWidth: 0,
    height: 0,
    halfHeight: 0,
  }

  entities = {
    solids: [] as Entity[],
    entities: [] as Entity[],
  }

  constructor( root:HTMLDivElement ) {
    this.uiManager = new UiManager( root )
    this.ctx = this.uiManager.registerCtx( `main`, `canvas` )
    this.setup()
    this.uiManager.startLoop( () => this.update(), 100 )

    ;(window as any).game = this // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  setup() {
    const { ctx } = this

    this.sizes.width = ctx.canvas.width
    this.sizes.halfWidth = this.sizes.width / 2

    this.sizes.height = ctx.canvas.height
    this.sizes.halfHeight = this.sizes.height / 2

    Entity.sizeMultiplier = 3
    this.entities.solids = [
      new PlatformEntity( 0, this.sizes.height - 20, this.sizes.width, 10 ),
      //
    ]
    this.entities.entities = [
      new PlayerEntity( this.sizes.halfWidth, this.sizes.height - 500 ),
      //
    ]
  }

  update() {
    const { ctx, sizes, entities } = this

    ctx.clearRect( 0, 0, sizes.width, sizes.height )

    entities.entities.forEach( entity => {
      entity.update({ surroundingSolids:entities.solids })
      entity.draw( ctx )
    } )

    entities.solids.forEach( entity => {
      entity.update()
      entity.draw( ctx )
    } )
  }
}
