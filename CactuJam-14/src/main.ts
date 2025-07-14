import { getLevel4 } from "./rhythmGame/level4"
import { getLevel3 } from "./rhythmGame/level3"
import { getLevel2 } from "./rhythmGame/level2"
import { getLevel1 } from "./rhythmGame/level1"
import { getLevel0, rhythmGameAudio, type RhythmGameBar, type RhythmGameLevel as RhythmGameLevel } from "./rhythmGame/level0"
import Ranfisz, { type LegsController } from "./ranfisz"
import brandRanfiszSrc from "./img/brand-ranfisz.png"
import brandDancefiszSrc from "./img/brand-dancefisz.png"
import classes from "./css/game.module.css"
import classesRhythm from "./css/game-rhythmGame.module.css"
import createRenderingContext from "./createRenderingContext"
import Keys from "./Keys"
import GameLoop, { type LoopCallbackData } from "./GameLoop"
import "./css/normalize.css"
import "./css/game.css"

type GameUi = {
  root: HTMLElement
  rhythmGameWrapper: HTMLDivElement
  points: HTMLSpanElement
  combo: HTMLSpanElement
  soundKeyArea: HTMLSpanElement
  bestPoints: HTMLSpanElement
  ctx: CanvasRenderingContext2D
  resetCanvas: () => void
  creditsPopup: HTMLDivElement
}

type Point = { x: number, y: number }

type RhythmGameActiveBar = {
  position: Point
  speed: number
  bar: RhythmGameBar
  color: string
  processed?: true
  reachable: boolean | `HIT`
}

export default class Game {
  ui: GameUi
  loop = new GameLoop()

  score = {
    points: 0,
    lastComboTime: 0,
    combo: 0,
  }

  rhythmGame = {
    doneLevels: new Set<number>(),
    audio: rhythmGameAudio,
    dancingLegMaxAngle: 45,
    barHitOffset: 23,
    // soundKeyAreaCenterHeight: 91,
    // soundKeyAreaCenterHeight: 57,
    soundKeyAreaCenterHeight: 61,
    barDimensions: { w:150, h:43 },
    level: getLevel0() as RhythmGameLevel,
    activebars: [] as RhythmGameActiveBar[],
    elapsedMs: 0,
  }

  colors = [
    `#FFFEED`,
    `#D1FEB8`,
    `#D5F6FB`,
    `#EBCCFF`,
    `#F6B8D0`,
    `#F8C57C`,
  ]

  constructor( gameRootElement:HTMLElement ) {
    console.log( `Constructing the game` )

    this.rhythmGame.doneLevels = new Set( this.storageRead<number[]>( `doneLevels` ) )

    gameRootElement.classList.toggle( classes.game )
    this.ui = this.constructUi( gameRootElement )

    this.runInitScene()
  }

  constructUi( root:HTMLElement ) {
    root.innerHTML = ``

    const createButton = (label:string, className:string, onClick:() => void) => {
      const button = document.createElement( `button` )
      if (className) className.split( / +/ ).forEach( c => button.classList.toggle( c ) )
      button.innerHTML = label
      button.onclick = onClick

      return button
    }

    const buildInitSceneUi = () => {
      const initScene = document.createElement( `div` )
      initScene.classList.toggle( classes.initScene )

      let menuCreated = false
      const createmenu = () => {
        if (menuCreated) return
        menuCreated = true

        const brand = document.createElement( `div` )
        brand.classList.toggle( classes.brand )
        initScene.append( brand )

        const brandRanfisz = document.createElement( `img` )
        brandRanfisz.src = brandRanfiszSrc
        brand.append( brandRanfisz )

        const brandDancefisz = document.createElement( `img` )
        brandDancefisz.src = brandDancefiszSrc
        brand.append( brandDancefisz )

        const createLevelButton = (levelCreator:() => RhythmGameLevel, minFromPreviousLevel?:[number, number]) => {
          const level = levelCreator()
          const btnWrapper = document.createElement( `div` )
          btnWrapper.classList.toggle( classes.menuButton )
          btnWrapper.classList.toggle( classes[ `buttonStartLvl-${level.inOrder}` ] )

          const btn = createButton( `${level.inOrder}. ${level.name}`, ``, () => {
            this.rhythmGame.level = levelCreator()
            this.runRhythmGameplayScene()
          } )
          btnWrapper.append( btn )


          const bestPointsValue = this.storageReadLevel<number>( level.inOrder, `bestPoints` )
          if (bestPointsValue || level.bonus) {
            const addons = document.createElement( `div` )
            addons.classList.toggle( classes.btnAddons )

            if (bestPointsValue) {
              const bestPoints = document.createElement( `span` )
              bestPoints.dataset.label = `Najlepszy wynik: `
              bestPoints.innerHTML = `${bestPointsValue}`
              addons.append( bestPoints )
            }

            if (level.bonus) {
              const bestPoints = document.createElement( `span` )
              bestPoints.dataset.label = `To runda bonusowa`
              addons.append( bestPoints )
            }

            btnWrapper.append( addons )
          }

          if (minFromPreviousLevel && (this.storageReadLevel<number>( minFromPreviousLevel[ 0 ], `bestPoints` ) ?? 0) < minFromPreviousLevel[ 1 ]) {
            const block = document.createElement( `div` )
            block.classList.toggle( classes.btnBlock )
            block.dataset.previousLevel = `${minFromPreviousLevel[ 0 ]}:${minFromPreviousLevel[ 1 ]}`
            block.innerHTML = `<span>${minFromPreviousLevel}</span>`

            btnWrapper.append( block )
          }

          return btnWrapper
        }

        initScene.append( createLevelButton( getLevel0 ) )
        initScene.append( createLevelButton( getLevel1, [ 1, 2500 ] ) )
        initScene.append( createLevelButton( getLevel2, [ 2, 3000 ] ) )
        initScene.append( createLevelButton( getLevel3, [ 3, 4000 ] ) )
        initScene.append( createLevelButton( getLevel4, [ 3, 4000 ] ) )
        initScene.append( createButton( `O_grze`, `${classes.menuButton} ${classes.buttonCredits}`, () => this.ui.creditsPopup.style.display = `block` ) )
      }

      initScene.addEventListener( `click`, createmenu, { once:true } )
      initScene.append( Ranfisz.getRanfiszInit( createmenu ) )

      root.append( initScene )

      return { initScene }
    }

    const buildRhythmGameUi = () => {
      const rhythmGameWrapper = document.createElement( `div` )
      rhythmGameWrapper.classList.toggle( classes.rhythmGameWrapper )
      root.append( rhythmGameWrapper )

      const soundKeyArea = document.createElement( `span` )
      soundKeyArea.classList.toggle( classesRhythm.soundKeyArea )
      rhythmGameWrapper.append( soundKeyArea )

      const combo = document.createElement( `span` )
      combo.innerHTML = `0`
      combo.classList.toggle( classesRhythm.combo )
      rhythmGameWrapper.append( combo )

      const points = document.createElement( `span` )
      points.innerHTML = `0`
      points.classList.toggle( classesRhythm.points )
      rhythmGameWrapper.append( points )

      const bestPoints = document.createElement( `span` )
      bestPoints.classList.toggle( classesRhythm.bestPoints )
      rhythmGameWrapper.append( bestPoints )

      rhythmGameWrapper.append( document.createElement( `canvas` ) )

      const dancingRanfisz = Ranfisz.getRanfiszDancingLegsWithController()
      dancingRanfisz.html.classList.toggle( classesRhythm.dancingRanfisz )
      rhythmGameWrapper.append( dancingRanfisz.html )

      rhythmGameWrapper.append( createButton( `Menu`, `closeButton`, () => this.endLevel() ) )

      return { rhythmGameWrapper, bestPoints, soundKeyArea, combo, points }
    }

    const createCreditsPopup = () => {
      const creditsHtml = `
        <div class="textContainer ${classes.creditsPopup}">
          <h2>O grze</h2>

          <p>Wstęp do gry można przyspieszyć, klikając na obszarze gry. Guziki powinny pojawić się natychmiast

          <p>
            <strong>Uwaga!</strong> Czasem poziom rozjeżdża się z muzyką.
            Muzyka powinna wystartować wraz z kliknięciem guzika startu.
            Jeżeli zauważyłeś rozjechanie się dźwięku ze sterowaniem,
            spróbuj włączyć poziom jeszcze raz.

          <h3>Autorstwo</h3>

          <p>Pełne dane dotyczące autorstwa wszelkich elementów gry:

          <dl>
            <dt>Avatar Ranfisza
            <dd>Od Ranfisza w osobie własnej za jego zgodą. O wszelką kradzież majestatu proszę posądzać właśnie Ranfisza, ja nic nie wiem, jestem niewinny

            <dt>Brand "Dancefisz"
            <dd>~Evolveye z użyciem narzędzia <a href="https://www.piskelapp.com">Piskel</a>

            <dt>Nogi Ranfisza
            <dd>Wygenerowano z pomocą <a href="https://hotpot.ai/attribution">HotpotAI</a>

            <dt>Font "Bit Cell"
            <dd>Pobrano z <a href="https://www.dafont.com/bit-cell.font">Dafont.com</a>. Font jest autorstwa <strong><a href="https://www.dafont.com/aaron-d-chand.d6569">memesbruh03</a></strong>, "100% free"

            <dt>Usuwanie tła
            <dd>Wszelkie tła konieczne do usunięcia, usunięto przy pomocy strony <a href="https://www.remove.bg/upload">remove.bg</a>

            <dt>Muzyka <a href="https://pixabay.com/music/video-games-pixel-fantasia-355123/">"Pixel Fantasia"</a> (poziom "Spacer Ranfisza")
            <dd>~<a href="https://pixabay.com/users/lofiewme-20401605/">Lofiewme</a> na <a href="https://pixabay.com/service/license-summary/">licencji Pixabay</a>

            <dt>Muzyka <a href="https://pixabay.com/music/video-games-8-bit-arcade-138828/">"8 bit Arcade"</a> (poziom "Ranfisz na łące")
            <dd>~<a href="https://pixabay.com/users/moodmode-33139253/">moodmode</a> na <a href="https://pixabay.com/service/license-summary/">licencji Pixabay</a>

            <dt>Muzyka <a href="https://pixabay.com/music/techno-trance-hyperion-hypercube-355494/">"Hyperion Hypercube"</a> (poziom "Ranfisz vs złe korporacje")
            <dd>~<a href="https://pixabay.com/users/psychronic-13092015/">Psychronic</a> na <a href="https://pixabay.com/service/license-summary/">licencji Pixabay</a>
          </dl>

          <button class="closeButton">Zamknij</button>
        </div>
      `

      root.insertAdjacentHTML( `beforeend`, creditsHtml )

      const creditsPopup = root.querySelector( `.${classes.creditsPopup}` ) as HTMLDivElement
      const creditsCloseButton = creditsPopup.querySelector( `.closeButton` ) as HTMLButtonElement
      creditsCloseButton.onclick = () => creditsPopup.style.removeProperty( `display` )

      return { creditsPopup }
    }

    const initScene = buildInitSceneUi()
    const thythmGame = buildRhythmGameUi()
    const creditsPopup = createCreditsPopup()
    const { ctx, resetCanvas } = createRenderingContext( `.${classes.game} canvas` )
    const ui:GameUi = { root, ctx, resetCanvas, ...initScene, ...thythmGame, ...creditsPopup }

    return ui
  }

  runInitScene() {
    const doneLevels = this.storageRead<number[]>( `doneLevels` ) ?? []
    this.ui.root.dataset.doneLevels = doneLevels.join( `,` )

    Array.from( this.ui.root.querySelectorAll( `[data-previous-level]` ) ).forEach( block => {
      const [ prevLevelInOrder, minPoints ] = (block as HTMLDivElement).dataset.previousLevel!.split( `:` )
      const prevLevelPoints = this.storageReadLevel<number>( Number( prevLevelInOrder ), `bestPoints` ) ?? 0

      if (prevLevelPoints >= Number( minPoints )) block.remove()
    } )

    this.ui.root.dataset.stage = `init`
  }

  runRhythmGameplayScene() {
    this.ui.root.dataset.stage = `rhythmGame`
    this.ui.resetCanvas()
    this.rhythmGame.activebars = []
    this.rhythmGame.elapsedMs = 0
    this.score.points = 0
    this.score.combo = 0
    this.score.lastComboTime = 0
    this.rhythmGame.dancingLegMaxAngle = 45
    this.ui.rhythmGameWrapper.style[ `--bouncing-multiplier` as `top` ] = `1`

    if (this.rhythmGame.level.skipTime) {
      this.rhythmGame.level.audio.currentTime = this.rhythmGame.level.skipTime / 1000
      this.rhythmGame.elapsedMs = this.rhythmGame.level.skipTime
    }

    const dancingRanfisz = Ranfisz.getRanfiszDancingLegsWithController( this.ui.rhythmGameWrapper )
    const bestPointsValue = this.storageReadLevel<number>( this.rhythmGame.level.inOrder, `bestPoints` )
    if (bestPointsValue) this.ui.bestPoints.innerHTML = `${bestPointsValue}`

    dancingRanfisz.rotateLeftLeg( 0 )
    dancingRanfisz.rotateRightLeg( 0 )

    this.ui.combo.innerHTML = `${this.score.combo}`
    this.ui.points.innerHTML = `${this.score.points}`

    this.rhythmGame.level.audio.play()
    this.rhythmGame.level.audio.addEventListener( `play`, () => {
      this.loop.startLoop( (timestamp, data) => this.tickGameplayLoop( timestamp, dancingRanfisz, data ) )
    }, { once:true } )
  }

  tickGameplayLoop( timestamp:number, legsController:LegsController, { timeDelta }:LoopCallbackData ) {
    this.rhythmGame.elapsedMs += timeDelta

    const { ctx } = this.ui
    const { elapsedMs, level, barDimensions, barHitOffset, soundKeyAreaCenterHeight } = this.rhythmGame

    ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
    ctx.font = `bold 40px monospace`

    const activebars = this.rhythmGame.activebars.filter( bar => {
      bar.position.y -= bar.speed * timestamp

      const x = bar.position.x - barDimensions.w / 2
      const y = ctx.canvas.height - bar.position.y
      const label = !Array.isArray( bar.bar.keys ) ? bar.bar.keys
        : bar.bar.keys.includes( `left` ) ? `<`
          : bar.bar.keys.includes( `right` ) ? `>`
            : bar.bar.keys.join( `,` )

      ctx.fillStyle = bar.reachable && !bar.processed ? bar.color : `${bar.color}55`
      ctx.fillRect( x, y - barDimensions.h / 2, barDimensions.w, barDimensions.h )

      const length = !bar.bar.lasts ? 0 : bar.bar.lasts / 4
      if (length) {
        const oneFifths = barDimensions.w / 10
        ctx.fillRect( bar.position.x - oneFifths, y - length, oneFifths * 2, length )
      }

      ctx.fillStyle = `black`
      ctx.fillText( label, x + 5, y - barDimensions.h / 2 + 33 )

      if (bar.position.y < soundKeyAreaCenterHeight - barHitOffset) {
        if (bar.reachable) {
          if (bar.reachable !== `HIT`) {
            this.endCombo( `Active field flew too far` )
            bar.reachable = false
          } else if (!Keys.isPressed( ...bar.bar.keys ) || bar.position.y < soundKeyAreaCenterHeight - barHitOffset - length) {
            bar.reachable = false
          }
        } else if (bar.position.y < -barDimensions.h - length) {
          return false
        }
      }

      return true
    } )

    if (Keys.isPressedOnce( `space` )) console.log( activebars[ 0 ]?.bar.timeMs )

    Array.from( Keys.keysMap.values() ).forEach( ({ code }) => {
      const activeBar = activebars.find( b => b.reachable && (b.bar.keys.includes( code )) )
      if (code === `space` && code.length > 5) return

      if (!activeBar) {
        this.endCombo( `No reachable active fields` )
        return
      }

      if (activeBar.reachable === `HIT`) {
        if (this.score.lastComboTime < Date.now() - 200) {
          this.score.lastComboTime = Date.now()
          this.addScores( false )
          this.log({ scope:`HIT`, subscope:`EXTENSION`, subscopeColor:`lime` })
        }
      } else if (soundKeyAreaCenterHeight - barHitOffset <= activeBar.position.y && activeBar.position.y <= soundKeyAreaCenterHeight + barHitOffset) {
        activeBar.reachable = `HIT`

        const angle = Math.random() * this.rhythmGame.dancingLegMaxAngle

        this.score.lastComboTime = Date.now()
        this.log( { scope:`HIT` }, `[${activeBar.bar.keys}]` )
        this.addScores()

        if (activeBar.bar.lasts) {
          activeBar.color = `cyan`
        } else {
          activeBar.processed = true
        }

        if (Math.random() > 0.5) legsController.rotateLeftLeg( angle )
        else legsController.rotateRightLeg( angle )
      } else {
        this.endCombo( `Active field is too far` )
      }
    } )

    if (level.bars.length) {
      while (level.bars[ 0 ]?.timeMs < elapsedMs) {
        const bar = level.bars.shift()!

        activebars.push({
          position: {
            x: ctx.canvas.width / 2 + bar.x,
            y: ctx.canvas.height + 10,
          },
          speed: bar.speed ?? 3,
          color: this.colors[ Math.floor( Math.random() * this.colors.length ) ],
          reachable: true,
          bar,
        })
      }
    } else if (!activebars.length) {
      this.endLevel()

    }

    this.rhythmGame.activebars = activebars
  }

  addScores( withCombo = true ) {
    this.score.points += 10 * (1 + this.score.combo / 5)
    this.ui.points.innerHTML = `${this.score.points}`

    if (withCombo) {
      this.score.combo += 1
      this.ui.combo.innerHTML = `${this.score.combo}`
    }

    const { points, combo } = this.score

    if (points > 6500 || combo >= 80) {
      this.rhythmGame.dancingLegMaxAngle = 400
      this.ui.rhythmGameWrapper.style[ `--bouncing-multiplier` as `top` ] = `3.5`
    }
    if (points > 4500 || combo >= 65) {
      this.rhythmGame.dancingLegMaxAngle = 250
      this.ui.rhythmGameWrapper.style[ `--bouncing-multiplier` as `top` ] = `3`
    }
    else if (points > 3000 || combo >= 50) this.rhythmGame.dancingLegMaxAngle = 175
    else if (points > 1000 || combo >= 35) this.ui.rhythmGameWrapper.style[ `--bouncing-multiplier` as `top` ] = `2.6`
    else if (points > 500 || combo >= 25) this.rhythmGame.dancingLegMaxAngle = 125
    else if (points > 300 || combo >= 15) this.ui.rhythmGameWrapper.style[ `--bouncing-multiplier` as `top` ] = `1.9`
    else if (points > 200 || combo >= 10) this.rhythmGame.dancingLegMaxAngle = 90
    else if (points > 100 || combo >= 5) this.ui.rhythmGameWrapper.style[ `--bouncing-multiplier` as `top` ] = `1.4`
  }
  endCombo( reason?:string ) {
    if (reason) this.log( { scope:`COMBO`, subscope:`RESET`, subscopeColor:`red` }, reason )
    this.score.combo = 0
    this.ui.combo.innerHTML = `0`
  }

  endLevel() {
    const level = this.rhythmGame.level
    const bestPoints = this.storageReadLevel<number>( level.inOrder, `bestPoints` )

    level.audio.currentTime = 0
    level.audio.pause()

    this.rhythmGame.doneLevels.add( level.inOrder )
    this.storageWrite( `doneLevels`, Array.from( this.rhythmGame.doneLevels ) )
    if (!bestPoints || this.score.points > bestPoints) this.storageWriteLevel( level.inOrder, `bestPoints`, this.score.points )
    this.loop.pauseLoop()
    this.runInitScene()
  }

  storageWrite( key:string, value:boolean | number | string | (boolean | number | string)[] ) {
    localStorage.setItem( key, JSON.stringify( value ) )
  }
  storageRead<T>( key:string ) {
    const value = localStorage.getItem( key )
    if (!value) return null

    return JSON.parse( value ) as T
  }
  storageReadLevel<T>( levelInOrder:number, key:string ) {
    return this.storageRead<T>( `rhythmgame-level-${levelInOrder}-${key}` )
  }
  storageWriteLevel( levelInOrder:number, key:string, value:Parameters<typeof this.storageWrite>[1] ) {
    return this.storageWrite( `rhythmgame-level-${levelInOrder}-${key}`, value )
  }

  log( namespace:{ scope: string, subscope?: string, subscopeColor?: string }, ...data:unknown[] ) {
    console.log(
      `%c[%c${namespace.scope}%c` + (!namespace.subscope ? `%c%c` : `|%c${namespace.subscope}%c`) +  `]`,
      `color:grey`,
      `color:gold; font-weight:bold;`,
      `color:grey`,
      `color:${namespace.subscopeColor ?? `cyan`}; font-weight:bold;`,
      `color:grey`,
      ...data,
    )
  }
}

declare global {
  interface Window {
    game: Game
  }
}

window.game = new Game( document.body )

