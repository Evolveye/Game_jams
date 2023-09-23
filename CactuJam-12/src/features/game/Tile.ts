import { TagHolder } from "./types"

export default class Tile implements TagHolder {
  color: string
  tags = new Set<string>()

  constructor( color:string, tags:string[] = [] ) {
    this.color = color
    tags.forEach( t => this.tags.add( t ) )
  }
}
