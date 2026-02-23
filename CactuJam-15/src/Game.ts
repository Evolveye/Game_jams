import { Rect } from "./logic/shapes"
import createTag from "./logic/createTag"
import controls from "./logic/controls"
import World, { type Drawable } from "./logic/World"
import Sprite from "./logic/Sprite"
import Loop from "./logic/Loop"
import Keys from "./logic/Keys"
import Camera from "./logic/Camera"
import { HumanEntity, Men, Women } from "./entities/human"
import heartImgSrc from "./entities/heart.png"
import growSkullImgSrc from "./entities/grow-skull.png"
import { FruitPlant } from "./entities/fruitPlant"
import fruitImgSrc from "./entities/fruit-static.png"
import { Fruit } from "./entities/fruit"
import { Copulation } from "./entities/copulation"
import arrowHeadImgSrc from "./entities/arrowHead.png"

type GameUi = {
  canvas: HTMLCanvasElement
  cursor: HTMLElement
  contextmenu: HTMLDivElement
  fruitsCount: HTMLSpanElement
  timeToLive: HTMLSpanElement
}

export default class Game {
  utilitiesSprites = {
    arrowHead: new Sprite( arrowHeadImgSrc, {
      framesPerRow: 2,
      framesPerColumn: 2,
      framePixelsPadding: 1,
    } ),
  }
  world: World
  camera: Camera
  player: HumanEntity
  loop = new Loop()
  copulations = new Set<Copulation>()

  settings = {
    copulationFruits: 10,
    copulationTimeSec: 10,
    fruitsToPlantCount: 1,
    handRange: 40,
  }

  ui: GameUi
  contextMenuEntity: undefined | Drawable
  ctx: CanvasRenderingContext2D

  constructor() {
    const [ ctx, ui ] = this.buildUi()

    this.ui = ui
    this.ctx = ctx

    this.world = new World({
      seed: Math.random() * 100,
      chunkSize: 256,
      widthInChunks: 16,
      heightInChunks: 16,
      maxTerrainDepth: 6,
    })

    this.camera = new Camera( ui.canvas.width, ui.canvas.height, this.world.width, this.world.height, ui.cursor )

    const player = this.world.findEntityNear<HumanEntity>( this.world.width / 2, this.world.height / 2, e => e instanceof HumanEntity )
    if (!player) throw new Error( `Missing player` )
    this.player = player

    this.camera.follow( Rect.getCenter( this.player.boundary ) )

    this.loop.startLoop( (mul, { iterationsCount }) => this.draw( ctx, mul, iterationsCount ) )
  }

  buildUi() {
    // DOM
    const canvas = createTag<HTMLCanvasElement>( `canvas`, { width:window.innerWidth, height:window.innerHeight } )
    const ctx = canvas.getContext( `2d` )
    if (!ctx) throw new Error( `Cannot create canvas context 2D` )

    ctx.imageSmoothingEnabled = false

    const fruitsCount = createTag( `span`, { children:0, style:`font-weight:bold; color:gold`  } )
    const timeToLive = createTag( `span`, { children:`--:--`, style:`font-weight:bold; color:gold`  } )
    const menu = createTag<HTMLDivElement>( `article`, {
      id: `menu`,
      children: [
        createTag( `section`, { children: [
          createTag( `hgroup`, { children: [
            createTag( `h1`, { children:`Wyspa golasów`, style:`color:pink`  } ),
            createTag( `p`, { children:`Alternatywna historia pierwszych ludzi` } ),
          ] } ),
          createTag( `hr` ),
          createTag( `p`, { children:`Jesteś nieśmiertelny!` } ),
          createTag( `p`, { children:`Przynajmniej do czasu. Zebranie pierwszego owocu sprowadzi śmierć na ten swiat.` } ),
          createTag( `h2`, { children:`Sterowanie` } ),
          createTag( `p`, { children: createTag( `dl`, { children: [
            createTag( `dt`, { children: [
              createTag( `b`, { children:`W` } ),
              `, `,
              createTag( `b`, { children:`S` } ),
              `, `,
              createTag( `b`, { children:`A` } ),
              `, `,
              createTag( `b`, { children:`D` } ),
              `, `,
              createTag( `b`, { children:`Strzałki` } ),
            ] } ),
            createTag( `dd`, { children:`Poruszanie się` } ),
            createTag( `dt`, { children:createTag( `b`, { children:`Lewy przycisk myszy` } ) } ),
            createTag( `dd`, { children: [
              `Wykonywanie akcji,`,
              createTag( `br` ),
              `w tym wybór postaci`,
            ] } ),
            createTag( `dt`, { children:createTag( `b`, { children:`Prawy przycisk myszy` } ) } ),
            createTag( `dd`, { children:`Menu kontekstowe (na niektóych elementach);` } ),
            createTag( `dt`, { children:createTag( `b`, { children:`Kółko myszy` } ) } ),
            createTag( `dd`, { children:`Przyblizanie/oddalanie` } ),
          ] } ) } ),
          createTag( `h2`, { children:`Znikoma instrukcja` } ),
          createTag( `p`, { children:`Zbieraj owoce;` } ),
          createTag( `p`, { children: [
            createTag( `span`, { children:`siej`, style:`color:lime` } ),
            ` plony;`,
          ] } ),
          createTag( `p`, { children: [
            createTag( `span`, { children:`poderwij`, style:`color:pink` } ),
            ` parę;`,
          ] } ),
          createTag( `p`, { children: [
            createTag( `span`, { children:`rozmnażaj się`, style:`color:red` } ),
            `!`,
          ] } ),
          createTag( `p`, { children:`Im dłuzej przetrwasz, tym dłuzej przetrwa gatunek, tym więcej punktów zdobędzisz!` } ),
          createTag( `hr` ),
          createTag( `p`, { children:`Produkcja wykonana przez ~Evolveye, z pomocą Gemini; grafiki rysownao w PiskelApp` } ),
        ] } ),

        createTag( `section`, { children: [
          createTag( `h2`, { children:`Przedmioty postaci` } ),
          createTag( `div`, { class: `stat`, children: [
            createTag( `img`, { width:22, height:22, src:fruitImgSrc } ),
            createTag( `p`, { children:`Liczba owoców:` } ),
            fruitsCount,
          ] } ),
          createTag( `div`, { class: `stat`, children: [
            createTag( `img`, { width:22, height:22, src:growSkullImgSrc } ),
            createTag( `p`, { children:`Starzenie za:` } ),
            timeToLive,
          ] } ),
        ] } ),
      ],
    } )

    const contextmenu = createTag<HTMLDivElement>( `div`, {
      id: `contextmenu`,
      class: `hidden`,
      children: [
        createTag( `button`, {
          class: `fastAction`,
          onClick: () => {
            if (!this.contextMenuEntity) {
              if (this.player.inventory.fruits === 0) return

              this.player.inventory.fruits--

              const pos = structuredClone( this.camera.pointerPos.ctxClick )
              const plant = new FruitPlant( pos.x, pos.y, this.world.sizeUnit, () => {
                const fruitA = new Fruit( pos.x - 5 * this.world.sizeUnit, pos.y, this.world.sizeUnit, undefined )
                this.world.spawnEntity( pos.x - 5 * this.world.sizeUnit, pos.y, fruitA )

                const fruitB = new Fruit( pos.x + 5 * this.world.sizeUnit, pos.y, this.world.sizeUnit, undefined )
                this.world.spawnEntity( pos.x + 5 * this.world.sizeUnit, pos.y, fruitB )

                this.world.despawnEntity( pos.x, pos.y, plant )
              } )

              this.world.spawnEntity( pos.x, pos.y, plant )
              fruitsCount.innerHTML = `${this.player.inventory.fruits}`
              this.toggleContextMenu( false )
            }
          },
          "data-only": `jungle`,
          children: [
            `Zasadź owoc`,
            createTag( `img`, { src:fruitImgSrc } ),
            createTag( `span`, { children: [
              `Wymaga ${this.settings.fruitsToPlantCount}`,
              createTag( `img`, { src:fruitImgSrc } ),
            ] } ),
          ],
        } ),

        createTag( `button`, {
          class: `fastAction`,
          onClick: () => {
            if (this.contextMenuEntity instanceof HumanEntity) {
              if (this.player.inventory.fruits === 0) return

              this.player.inventory.fruits--
              this.contextMenuEntity.inventory.fruits++
              fruitsCount.innerHTML = `${this.player.inventory.fruits}`
            }
          },
          "data-only": `human`,
          children: [
            `Przekaż owoc`,
            createTag( `img`, { src:fruitImgSrc } ),
          ],
        } ),

        createTag( `button`, {
          class: `fastAction`,
          onClick: () => {
            if (this.contextMenuEntity instanceof HumanEntity) {
              if (this.player instanceof Men) this.copulate( this.player, this.contextMenuEntity )
              else this.copulate( this.contextMenuEntity, this.player )

              fruitsCount.innerHTML = `${this.player.inventory.fruits}`
            }
          },
          "data-only": `couple`,
          children: [
            `Kopuluj`,
            createTag( `img`, { src:heartImgSrc } ),
            createTag( `span`, { children: [
              `Wymaga ${this.settings.copulationFruits}`,
              createTag( `img`, { src:fruitImgSrc } ),
            ] } ),
            `u każdego osobnika`,
          ],
        } ),
      ],
    } )

    const cursor = createTag<HTMLElement>( `i`, { id:`cursor` } )

    document.body.innerHTML = ``
    document.body.appendChild( canvas )
    document.body.appendChild( menu )
    document.body.appendChild( contextmenu )
    document.body.appendChild( cursor )


    // Events
    window.addEventListener( `wheel`, e => {
      if (!(e.target instanceof HTMLElement) || !e.target.closest( `canvas` )) return

      e.preventDefault()

      const zoomSpeed = 0.1
      if (e.deltaY < 0) {
        this.camera.zoom = Math.min( this.camera.zoom + zoomSpeed, 3.0 ) // Max 300%
      } else {
        this.camera.zoom = Math.max( this.camera.zoom - zoomSpeed, 0.5 ) // Min 50%
      }

      this.camera.follow( Rect.getCenter( this.player.boundary ) )
    }, { passive:false } )

    window.addEventListener( `pointerdown`, e => {
      if (!(e.target instanceof HTMLElement)) return
      if (!e.target.closest( `#contextmenu` )) this.toggleContextMenu( false )
      console.log( `%cAt (${e.clientX}, ${e.clientY}) is %c${this.world.getTileAt( this.camera.pointerPos.inGame.x, this.camera.pointerPos.inGame.y )}`, `color:gray`, `font-weight:bold` )
    }, { passive:false } )

    window.addEventListener( `contextmenu`, e => e.preventDefault(), { passive:false } )


    // Return
    return [ ctx, {
      canvas,
      cursor,
      contextmenu,
      fruitsCount,
      timeToLive,
    } ] as const
  }

  changePlayer( entity?:HumanEntity, options:{ withoutSpriteChange?: boolean } = {} ) {
    if (!entity || this.player === entity) return

    if (!options.withoutSpriteChange) this.player.changeSprite( `idle` )
    this.player = entity
    this.ui.fruitsCount.innerHTML = `${this.player.inventory.fruits}`
  }

  toggleContextMenu( show:boolean ) {
    const { contextmenu } = this.ui

    this.camera.activePointers.mouseRight = false
    this.contextMenuEntity = this.world.findEntityNear<Drawable>(
      this.camera.pointerPos.inGame.x, this.camera.pointerPos.inGame.y, 1,
      e => e !== this.player && Rect.containsPoint( e.boundary, this.camera.pointerPos.inGame ),
    )

    if (!contextmenu.classList.contains( `hidden` )) {
      if (show) return

      contextmenu.classList.add( `hidden` )
      contextmenu.querySelectorAll<HTMLElement>( `[data-only]` ).forEach( ele => ele.classList.remove( `showed` ) )
    } else {
      if (!show) return

      contextmenu.style.left = `${this.camera.pointerPos.x}px`
      contextmenu.style.top = `${this.camera.pointerPos.y}px`

      if (!this.contextMenuEntity) {
        const dist = Rect.getDistance( this.player.collideBoundary, new Rect( this.camera.pointerPos.inGame.x, this.camera.pointerPos.inGame.y, 1, 1 ) )
        const tile = this.world.getTileAt( this.camera.pointerPos.inGame.x, this.camera.pointerPos.inGame.y )
        if (dist < this.settings.handRange && tile === `jungle`) contextmenu.querySelectorAll<HTMLElement>( `[data-only="jungle"]` ).forEach( ele => ele.classList.add( `showed` ) )
      } else {
        const isCouple = this.contextMenuEntity instanceof HumanEntity && this.contextMenuEntity.stage !== `young` && this.player.stage !== `young` && (
          this.contextMenuEntity instanceof Men && this.player instanceof Women ||
          this.contextMenuEntity instanceof Women && this.player instanceof Men
        )

        contextmenu.querySelectorAll<HTMLElement>( `[data-only="human"]` ).forEach( ele => ele.classList.add( `showed` ) )
        if (isCouple) contextmenu.querySelectorAll<HTMLElement>( `[data-only="couple"]` ).forEach( ele => ele.classList.add( `showed` ) )
      }

      const items = contextmenu.querySelectorAll<HTMLElement>( `& > :is( :not( [data-only] ), [data-only].showed )` )
      if (items.length) contextmenu.classList.remove( `hidden` )
    }
  }

  draw( ctx:CanvasRenderingContext2D, timeMultiplier:number, iterationsCount:number ) {
    // Dead player processing
    if (this.player.stage === `dead`) {
      const newPlayer = this.world.findEntityNear<HumanEntity>( this.world.width / 2, this.world.height / 2, Infinity, e => e instanceof HumanEntity && e.stage !== `dead` )
      if (newPlayer) this.changePlayer( newPlayer, { withoutSpriteChange:true } )
      else alert( `Game over` )
    }


    // Setup
    const { camera, player } = this
    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.save()

    camera.apply( ctx )
    camera.followSlowly( Rect.getCenter( this.player.boundary ) )

    const posBefore = Rect.getCenter( player.collideBoundary )
    const speed = player.getSpeed() * timeMultiplier
    const playerPos = player.boundary
    const playerVelocity = player.velocity
    const playerFlip = player.sprites.current!.flip
    let cursorChanged = false


    // Player logic
    if (!player.locked) {
      if (Keys.isPressed( controls.up )) playerVelocity.y -= speed
      if (Keys.isPressed( controls.down )) playerVelocity.y += speed
      if (Keys.isPressed( controls.left )) playerVelocity.x -= speed
      if (Keys.isPressed( controls.right )) playerVelocity.x += speed

      playerFlip.x = false
      if (player.velocity.x > 0) player.changeSprite( `walking` )
      else if (playerVelocity.x < 0) {
        player.changeSprite( `walking` )
        playerFlip.x = true
      } else {
        if (playerVelocity.y < 0) player.changeSprite( `walking` )
        else if (playerVelocity.y > 0) {
          player.changeSprite( `walking` )
          playerFlip.x = true
        } else player.changeSprite( `idle` )
      }


      playerPos.x += playerVelocity.x
      playerPos.y += playerVelocity.y
      player.updateBoundaries()

      this.world.moveEntity( posBefore, player )

      playerVelocity.x = 0
      playerVelocity.y = 0
    }


    // World draw
    const visibleChunks = this.world.drawTerrain({ ctx, timeMultiplier, camera, updatePosition:this.world.moveEntity })

    const nearEntitiesGen = this.world.getNearEntitiesGenerator<Drawable>(
      posBefore.x, posBefore.y, 1,
      e => e !== player && Rect.getDistance( player.collideBoundary, e.collideBoundary ?? e.boundary ) < this.settings.handRange,
    )

    const cursorEntity = this.world.findEntityNear<Drawable>(
      camera.pointerPos.inGame.x, camera.pointerPos.inGame.y, 1,
      e => e !== player && Rect.containsPoint( e.boundary, camera.pointerPos.inGame ),
    )

    ctx.fillStyle = `#aaa`
    for (const entity of nearEntitiesGen) {
      if (Rect.containsPoint( entity.boundary, camera.pointerPos.inGame )) {
        camera.updateCursor( `action` )
        cursorChanged = true
        ctx.fillStyle = `#fff`
        ctx.fillRect( entity.boundary.x, entity.boundary.y + entity.boundary.height - 2, entity.boundary.width, 2 )
        ctx.fillStyle = `#aaa`
      } else {
        ctx.fillRect( entity.boundary.x, entity.boundary.y + entity.boundary.height - 2, entity.boundary.width, 2 )
      }

      if (entity === cursorEntity) {
        if (cursorEntity instanceof HumanEntity) {
          if (camera.activePointers.mouseRight) this.toggleContextMenu( true )
        } else if (cursorEntity instanceof Fruit) {
          if (camera.activePointers.mouseLeft) {
            this.world.despawnEntity( entity.boundary.x, entity.boundary.y, cursorEntity )
            this.player.inventory.fruits++
            this.ui.fruitsCount.innerHTML = `${this.player.inventory.fruits}`
          }
        }
      }
    }

    if (!cursorEntity && camera.activePointers.mouseRight) {
      this.toggleContextMenu( true )
    } else if (cursorEntity instanceof HumanEntity) {
      if (camera.activePointers.mouseLeft) this.changePlayer( cursorEntity )
      if (!cursorChanged) {
        cursorChanged = true
        camera.updateCursor( `action` )
      }
    }

    this.world.drawEntities( visibleChunks, { ctx, timeMultiplier, camera, updatePosition:this.world.moveEntity } )


    // Utilities
    ctx.globalAlpha = 0.25
    this.utilitiesSprites.arrowHead.draw(
      ctx,
      player.boundary.x + player.boundary.width / 2 - this.world.sizeUnit * 4,
      player.boundary.y - 50,
      this.world.sizeUnit * 8,
      this.world.sizeUnit * 11,
    )
    ctx.globalAlpha = 1
    if (iterationsCount % 30 === 0) {
      const seconds = Math.floor( player.timeToGrow / 1000 )
      this.ui.timeToLive.innerHTML = ``
        + `${Math.floor( seconds / 60 )}`.padStart( 2, `0` )
        + `:`
        + `${seconds % 60}`.padStart( 2, `0` )

      this.utilitiesSprites.arrowHead.nextFrame()
    }

    for (const copulation of this.copulations) {
      if (iterationsCount % 30 === 0) copulation.sprite.nextFrame()

      copulation.sprite.draw(
        ctx,
        copulation.x - 17 * this.world.sizeUnit,
        copulation.y,
        copulation.sprite.getWidth() * this.world.sizeUnit,
        copulation.sprite.getHeight() * this.world.sizeUnit,
      )
    }


    // Cleaning
    ctx.restore()

    if (!cursorChanged) camera.updateCursor( `default` )
  }

  copulate( men:Men, women:Women ) {
    men.inventory.fruits -= this.settings.copulationFruits
    women.inventory.fruits -= this.settings.copulationFruits

    const menRip = men.inventory.fruits < 0
    const womenRip = women.inventory.fruits < 0

    if (menRip) men.changeStage( `dead` )
    if (womenRip) women.changeStage( `dead` )
    if (menRip || womenRip) return

    const menPosBefore = Rect.getCenter( men.collideBoundary )
    const womenPosBefore = Rect.getCenter( women.collideBoundary )
    const sizeUnit = this.world.sizeUnit
    const menOffset = this.world.sizeUnit * 2

    const referencePos = {
      x: (menPosBefore.x + womenPosBefore.x) / 2,
      y: (menPosBefore.y + womenPosBefore.y) / 2 - men.boundary.height,
    }

    men.locked = true
    men.boundary.x = referencePos.x - 15 * sizeUnit
    men.boundary.y = referencePos.y
    men.updateBoundaries()
    this.world.moveEntity( menPosBefore, men )

    women.locked = true
    women.boundary.x = referencePos.x + 14 * sizeUnit
    women.boundary.y = referencePos.y + menOffset
    women.updateBoundaries()
    this.world.moveEntity( womenPosBefore, women )

    const copulation = new Copulation( referencePos.x, referencePos.y )
    this.copulations.add( copulation )
    setTimeout( () => {
      this.copulations.delete( copulation )
      women.locked = false
      men.locked = false

      const tag = this.world.getTileAt( referencePos.x, referencePos.y )
      if (!tag) throw new Error( `Missing chunk tag` )

      const x = referencePos.x + 3 * sizeUnit
      const y = referencePos.y + 17 * sizeUnit

      if (Math.random() > 0.5) {
        const human = new Men( x, y, sizeUnit, tag )
        human.changeStage( `young` )

        this.world.spawnEntity( x, y, human )
      } else {
        const human = new Women( x, y + menOffset, sizeUnit, tag )
        human.changeStage( `young` )

        this.world.spawnEntity( x, y + menOffset, human )
      }
    }, 1000 * this.settings.copulationTimeSec )

    this.toggleContextMenu( false )
  }
}
