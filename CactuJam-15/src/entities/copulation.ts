import Sprite from "../logic/Sprite"
import copulationImgSrc from "./copulation-@2.png"

export class Copulation {
  sprite = new Sprite( copulationImgSrc, {
    framesPerRow: 2,
    framesPerColumn: 3,
    framePixelsPadding: 1,
  } )

  constructor( public x:number, public y:number ) {}
}
