import { TagHolder } from "./types"
import Tile from "./Tile"

export default class Cell implements TagHolder {
  tags = new Set<string>()
  items: (undefined | Tile)[] = []

  constructor( ...items:Tile[] ) {
    this.items = items
  }

  push( tile:Tile ) {
    this.items.push( tile )
  }

  clear() {
    this.items = []
  }

  clone( cell:Cell ) {
    this.items = [ ...cell.items ]
  }

  getTop() {
    return this.items[ this.items.length - 1 ] ?? null
  }
}
