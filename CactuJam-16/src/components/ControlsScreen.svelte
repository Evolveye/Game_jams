<script module lang="ts">
  import type { MenuScreenOption } from "./MenuScreen.svelte"

  /** One key slot of an action: its key label (`null` when empty), and whether it waits for a new key. */
  export type ControlSlot = { keyLabel:null | string, isSelected:boolean, isWaiting:boolean }
  export type ControlRow = { action:string, label:string, slots:ControlSlot[] }

  /** The controls view: every action with its keys, and options below (reset, back). All content comes from the game. */
  export type ControlsScreenData = {
    rows: ControlRow[]
    options: (MenuScreenOption & { isSelected:boolean })[]
    /** A short message, e.g. why a key could not be set. */
    message: null | string
    hint: string
    onSlotSelect: (row:number, slot:number) => void
    onSlotHover: (row:number, slot:number) => void
    onOptionSelect: (index:number) => void
    onOptionHover: (index:number) => void
  }
</script>

<script lang="ts">
  import Dialog from "./ui/Dialog.svelte"
  import KeyCap from "./ui/KeyCap.svelte"
  import OptionButtons from "./ui/OptionButtons.svelte"

  let { data }:{
    data: ControlsScreenData
  } = $props()
</script>

<Dialog title="Sterowanie" hint={data.hint}>
  <table class="table">
    <tbody>
      {#each data.rows as row, rowIndex (row.action)}
        <tr>
          <th scope="row">{row.label}</th>

          {#each row.slots as slot, slotIndex (slotIndex)}
            <td>
              <button
                type="button"
                class="slot"
                class:selected={slot.isSelected}
                class:waiting={slot.isWaiting}
                tabindex="-1"
                onclick={() => data.onSlotSelect( rowIndex, slotIndex )}
                onmousemove={() => data.onSlotHover( rowIndex, slotIndex )}
              >
                {#if slot.isWaiting}
                  <span class="waiting-text">Naciśnij…</span>
                {:else if slot.keyLabel}
                  <KeyCap label={slot.keyLabel} />
                {:else}
                  <span class="empty">—</span>
                {/if}
              </button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>

  <p class="message">{data.message ?? ``}</p>

  <OptionButtons options={data.options} columns={2} onSelect={data.onOptionSelect} onHover={data.onOptionHover} />
</Dialog>

<style>
  .table {
    margin: 12px auto 0;
    border-collapse: separate;
    border-spacing: 6px 2px;
  }

  th {
    padding-right: 12px;
    color: #d6d3d1;
    font-weight: normal;
    text-align: left;
    white-space: nowrap;
  }

  .slot {
    min-width: 110px;
    padding: 3px 8px;
    border: 2px solid #44403c;
    border-radius: 6px;
    background: #1c1917;
    color: #d6d3d1;
    font: inherit;
    cursor: pointer;
  }

  .slot:hover {
    border-color: #78716c;
  }

  .slot.selected {
    border-color: #e8c872;
    background: #3f3a2e;
  }

  .slot.waiting {
    border-color: #e8c872;
    background: #57442a;
  }

  .waiting-text {
    color: #e8c872;
    font-size: 14px;
  }

  .empty {
    color: #57534e;
  }

  /* Keeps its height when empty, so the layout does not jump. */
  .message {
    min-height: 1.4em;
    margin: 4px 0 -8px;
    color: #fca5a5;
    font-size: 14px;
  }
</style>
