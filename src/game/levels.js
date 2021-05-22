import { Rock } from "./entities.js"
import imageGrass from "../images/land_grass04.png"
import imageDirtyRoad from "../images/land_dirt05.png"
import imageDirtyRoadLeftGrass from "../images/land_grass05.png"
import imageDirtyRoadRightGrass from "../images/land_grass03.png"
import imageDirtyRoadCornerLBGrass from "../images/land_grass08.png"
import imageDirtyRoadCornerLB2Grass from "../images/land_grass02.png"
import imageDirtyRoadCornerLTGrass from "../images/land_grass12.png"
import imageDirtyRoadCornerLT2Grass from "../images/land_grass07.png"
import imageDirtyRoadCornerRBGrass from "../images/land_grass10.png"
import imageDirtyRoadCornerRB2Grass from "../images/land_grass01.png"
import imageDirtyRoadCornerRTGrass from "../images/land_grass14.png"
import imageDirtyRoadCornerRT2Grass from "../images/land_grass06.png"

/** @typedef {import("./index.js").default} Game */

export class Level {
  images = {
    roadCornerRT2Grass: new Image(),
    roadCornerRTGrass: new Image(),
    roadCornerRB2Grass: new Image(),
    roadCornerRBGrass: new Image(),
    roadCornerLT2Grass: new Image(),
    roadCornerLTGrass: new Image(),
    roadCornerLB2Grass: new Image(),
    roadCornerLBGrass: new Image(),
    roadRightGrass: new Image(),
    roadLeftGrass: new Image(),
    dirtyRoad: new Image(),
  }

  distanceY = 0
  roadSize = 128


  /**
   * @param {object} param0
   * @param {string} param0.backgroundImage
   * @param {string[]} param0.map
   * @param {(game:Game) => void} param0.init
   */
  constructor({ speed, map, backgroundImage, init }) {
    this.speed = speed
    this.backGroundImage = new Image
    this.backGroundImage.src = backgroundImage
    this.init = init

    const longestMapStr = map.reduce( (num, str) => str.length > num ? str.length : num, 0 )

    this.map = map.map( str => str.split( `` ) )
      .map( chars => {
        while (chars.length < longestMapStr) chars.push( ` ` )

        return chars
      } )
      .map( (chars, y, map) => chars.map( (char, x) => {
        if (char == `r`) return char

        if (chars[ x - 1 ] == `r`) return `o`
        if (chars[ x + 1 ] == `r`) return `o`
        if (map[ y + 1 ]?.[ x ] == `r`) return `o`
        if (map[ y - 1 ]?.[ x ] == `r`) return `o`

        return char
      } ) )

    this.images.roadCornerRT2Grass.src = imageDirtyRoadCornerRT2Grass
    this.images.roadCornerRTGrass.src = imageDirtyRoadCornerRTGrass
    this.images.roadCornerRB2Grass.src = imageDirtyRoadCornerRB2Grass
    this.images.roadCornerRBGrass.src = imageDirtyRoadCornerRBGrass
    this.images.roadCornerLT2Grass.src = imageDirtyRoadCornerLT2Grass
    this.images.roadCornerLTGrass.src = imageDirtyRoadCornerLTGrass
    this.images.roadCornerLB2Grass.src = imageDirtyRoadCornerLB2Grass
    this.images.roadCornerLBGrass.src = imageDirtyRoadCornerLBGrass
    this.images.roadRightGrass.src = imageDirtyRoadRightGrass
    this.images.roadLeftGrass.src = imageDirtyRoadLeftGrass
    this.images.dirtyRoad.src = imageDirtyRoad
  }


  generatebackground( ctx ) {
    const { backGroundImage:bgr, map, roadSize, images } = this
    const { width, height } = ctx.canvas

    ctx.canvas.height = roadSize * map.length

    for (let w = 0;  w < width;  w += bgr.width) {
      for (let h = 0;  h < roadSize * map.length;  h += bgr.height) {
        ctx.drawImage( bgr, w, h, bgr.width, bgr.height )
      }
    }

    const firstMapX = width / 2 - map[ 0 ].length / 2 * roadSize
    const roadLeft = images.roadLeftGrass
    const roadRight = images.roadRightGrass

    map.forEach( (chars, y) => chars.forEach( (char, x) => {
      const roadX = firstMapX + x * roadSize
      const roadY = y * roadSize

      switch (char) {
        case `r`: {
          let roadRightSprite = images.roadRightGrass

          if (map[ y + 1 ]?.[ x + 1 ] == `r`) {
            ctx.drawImage( images.roadCornerLBGrass,  roadX + roadSize,     roadY, roadSize, roadSize )
            ctx.drawImage( images.roadCornerLB2Grass, roadX + roadSize * 2, roadY, roadSize, roadSize )
          } else if (map[ y - 1 ]?.[ x + 1 ] == `r`) {
            ctx.drawImage( images.roadCornerLTGrass,  roadX + roadSize,     roadY, roadSize, roadSize )
            ctx.drawImage( images.roadCornerLT2Grass, roadX + roadSize * 2, roadY, roadSize, roadSize )
          } else {
            ctx.drawImage( roadRightSprite, roadX + roadSize, roadY, roadSize, roadSize )
          }

          // ctx.drawImage( roadLeft, roadX - roadSize, roadY, roadSize, roadSize )
          ctx.drawImage( images.dirtyRoad, roadX, roadY, roadSize, roadSize )
          // ctx.drawImage( roadRightSprite, roadX + roadSize, roadY, roadSize, roadSize )


          if (map[ y + 1 ]?.[ x - 1 ] == `r`) {
            ctx.drawImage( images.roadCornerRBGrass,  roadX - roadSize,     roadY, roadSize, roadSize )
            ctx.drawImage( images.roadCornerRB2Grass, roadX - roadSize * 2, roadY, roadSize, roadSize )
          } else if (map[ y - 1 ]?.[ x - 1 ] == `r`) {
            ctx.drawImage( images.roadCornerRTGrass,  roadX - roadSize,     roadY, roadSize, roadSize )
            ctx.drawImage( images.roadCornerRT2Grass, roadX - roadSize * 2, roadY, roadSize, roadSize )
          } else {
            ctx.drawImage( roadLeft, roadX - roadSize, roadY, roadSize, roadSize )
          }
          break
        }
      }

    } ) )
  }


  tick() {
    this.distanceY += this.speed
  }
}

export default [
  new Level({
    speed: 1,
    backgroundImage: imageGrass,
    road: imageGrass,
    init: game => {
      const { ctx, player, entities } = game
      const { width, height } = ctx.canvas

      player.visible = true
      player.moveTo( width / 2, height - 200 )

      for (let i = 0;  i < 10;  ++i) {
        entities.push( new Rock( 200, Math.floor( Math.random() * height ) ) )
      }
    },
    map: [
      ` r`,
      `r`,
      `r`,
      `r`,
      ` r`,
      `  r`,
      ` vr`,
      ` r^`,
      ` r`,
      ` r`,
    ],
  }),
]
