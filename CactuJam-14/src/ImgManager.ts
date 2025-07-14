export default class ImgManager {
  static createImage( attributes:Record<string, number | string> ) {
    const img = document.createElement( `img` ) as HTMLImageElement
    Object.entries( attributes ).forEach( ([ k, v ]) => img.setAttribute( k, `${v}` ) )
    return img
  }
}
