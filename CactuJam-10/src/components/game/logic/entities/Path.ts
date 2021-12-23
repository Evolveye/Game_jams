import pathSrc from "../../img/path.png"
import snowPathSrc1 from "../../img/path-1.png"
import snowPathSrc2 from "../../img/path-2.png"
import Entity from "../Entity"

const pathSrcs = [ pathSrc, snowPathSrc1, snowPathSrc2 ]
const randPathSrc = () => {
  const rand = Math.random()

  if (rand > 0.90) return snowPathSrc2
  if (rand > 0.60) return snowPathSrc1

  return pathSrc
}

export type PathConfig = {
  size?: number
}

export default class Path extends Entity {
  constructor( x:number, y:number, { size = 1 }:PathConfig = {} ) {
    super( x, y, { size, spriteSrc:randPathSrc() } )
  }

  tick = () => {}
}
