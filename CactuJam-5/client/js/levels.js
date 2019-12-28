import Game from "./engine.js"

/** @type {Map<String,{ tiles:Any script:Function events:Function }>} */
export default new Map( [
  [ `intro`, {
    tiles: [ [ `monster` ] ],
    /** @param {Game} game */
    async script( game ) {
      /** @type {RenderingContext} */
      const ctx = document.querySelector( `.canvas-helper` ).getContext( `2d` )
      const cache = game.storage.userData
      const { map_firstJam, map_secondJam } = cache
      const { width, height } = ctx.canvas

      const monster = game.level.everyId( `monster` ).next().value.entity

      const move = (entity, x, y, i=1000) => {
        entity.translateX += x
        entity.translateY += y

        if (i <= 0) return

        i--

        setTimeout( () => move( entity, x, y, i ), 10 )
      }

      ctx.imageSmoothingEnabled = false


      // *
      // scene 1
      // Pacman zamienia się w oko bo najadł się prezentów, odlatuje
      ctx.drawImage( map_secondJam, width / 2 - 250 / 2, height / 2 - 250 / 2, 250, 250 )

      // ctx.drawImage( map_secondJam, width / 2 - 250 / 2, height / 2 - 250 / 2, 250, 250 )
      // monster.translateX = 70
      // monster.translateY = 120
      // monster.rotateAngle = 200
      // move( monster, -.5, -.15 )

      // *
      // scene 2
      // przelatuje and wyspami i zacyzna zamrażać

      ctx.drawImage( game.storage.userData.map_firstJam, 0, 0, 500, 500 )

      // *
      // scene 3
      // pojawiasz się na mapie, uciekasz jak mario

    },
    /** @param {Number} eventInOrder @param {Game} game */
    events( eventInOrder, game ) {}
  } ],
] )