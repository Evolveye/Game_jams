import type { InventorySlot } from "../../components/Inventory.svelte"
import Item from "./Item"
import type { ItemKind } from "./items"

/** Items held by an entity, one of them selected. Composed into entities, e.g. `inventory = new Inventory([ "fist" ])`. */
export default class Inventory {
  items: Item[] = []
  selectedIndex = 0
  /** Something the view shows has changed since the last `getChangedSlots()`. */
  #hasChanges = true

  constructor( kinds:ItemKind[] = [] ) {
    for (const kind of kinds) this.items.push( new Item( kind ) )
  }

  get selected(): undefined | Item {
    return this.items[ this.selectedIndex ]
  }

  has( kind:ItemKind ) {
    return this.items.some( item => item.kind === kind )
  }

  /** Adds an item (or finds the one already held) and selects it. */
  add( kind:ItemKind ) {
    const heldIndex = this.items.findIndex( item => item.kind === kind )

    if (heldIndex >= 0) this.selectedIndex = heldIndex
    else this.selectedIndex = this.items.push( new Item( kind ) ) - 1

    this.#hasChanges = true
    return this.items[ this.selectedIndex ]
  }

  /** Takes an item out, e.g. when it gets stolen. */
  remove( kind:ItemKind ) {
    const index = this.items.findIndex( item => item.kind === kind )
    if (index < 0) return null

    const [ item ] = this.items.splice( index, 1 )

    // Keep the same item selected, or the next one if the selected item was removed.
    if (index < this.selectedIndex) this.selectedIndex--
    this.selectedIndex = Math.min( this.selectedIndex, Math.max( 0, this.items.length - 1 ) )

    this.#hasChanges = true
    return item
  }

  /** Selects the next (`1`) or previous (`-1`) item, wrapping around. */
  select( step:number ) {
    const count = this.items.length
    if (!count) return

    this.selectedIndex = (this.selectedIndex + step + count) % count
    this.#hasChanges = true
  }

  update( seconds:number ) {
    for (const item of this.items) {
      // A recharging item changes its readiness every frame, up to and including the frame it becomes ready.
      if (!item.isReady) this.#hasChanges = true
      item.update( seconds )
    }
  }

  /** Data for the inventory view, or `null` when nothing changed since the last call. */
  getChangedSlots() {
    if (!this.#hasChanges) return null

    this.#hasChanges = false
    return this.getSlots()
  }

  /** Data for the inventory view. */
  getSlots() {
    return this.items.map<InventorySlot>( (item, index) => ({
      id: item.kind,
      label: item.definition.name,
      icon: item.definition.icon,
      isSelected: index === this.selectedIndex,
      readiness: item.readiness,
      stats: item.getStats(),
    }) )
  }
}
