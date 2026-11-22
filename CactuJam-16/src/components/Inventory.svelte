<script module lang="ts">
  export type InventoryStat = { label:string, value:number | string }

  /** One held item. All its content comes from the game; the view only displays it. */
  export type InventorySlot = {
    id: string
    label: string
    /** Image URL. */
    icon: string
    isSelected: boolean
    /** From 0 (just used) to 1 (ready to use again). */
    readiness: number
    stats: InventoryStat[]
  }
</script>

<script lang="ts">
  let { slots }:{
    slots: InventorySlot[]
  } = $props()
</script>

<ol class="inventory">
  {#each slots as slot (slot.id)}
    <li class="slot" class:selected={slot.isSelected}>
      <img class="icon" src={slot.icon} alt="" />
      <span class="name">{slot.label}</span>

      {#if slot.stats.length}
        <span class="stats">
          {#each slot.stats as stat (stat.label)}
            <span class="stat">{stat.label} <b>{stat.value}</b></span>
          {/each}
        </span>
      {/if}

      <span class="readiness" class:ready={slot.readiness >= 1}>
        <span class="readiness-fill" style:width="{slot.readiness * 100}%"></span>
      </span>
    </li>
  {/each}
</ol>

<style>
  .inventory {
    display: flex;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: clamp(11px, 1.1vw, 14px);
  }

  .slot {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 6px;
    align-items: center;
    min-width: 7.5em;
    padding: 5px 8px 6px;
    border: 2px solid #44403c;
    border-radius: 6px;
    background: rgba(28, 25, 23, 0.8);
    color: #d6d3d1;
    opacity: 0.75;
  }

  .slot.selected {
    border-color: #e8c872;
    color: #f5f5f4;
    opacity: 1;
  }

  /* Pixel art: scaled up without blurring. */
  .icon {
    width: 1.2em;
    height: 1.2em;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .name {
    font-weight: bold;
  }

  .stats {
    display: flex;
    grid-column: 1 / -1;
    gap: 8px;
    color: #a8a29e;
    font-size: 0.85em;
  }

  .stat b {
    color: #f5f5f4;
  }

  /* Cooldown: fills up until the item can be used again. */
  .readiness {
    grid-column: 1 / -1;
    height: 4px;
    margin-top: 2px;
    overflow: hidden;
    border-radius: 2px;
    background: #44403c;
  }

  .readiness-fill {
    display: block;
    height: 100%;
    background: #a16207;
  }

  .readiness.ready .readiness-fill {
    background: #84cc16;
  }
</style>
