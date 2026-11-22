<script module lang="ts">
  import type { ButtonVariant } from "./ui/Button.svelte"

  export type MenuRow = { label:string, value:string }
  export type MenuScreenOption = { label:string, variant?:ButtonVariant, isWide?:boolean }

  /** A menu: title, optional summary rows, and options. All content comes from the game. */
  export type MenuScreenData = {
    title: string
    subtitle?: string
    rows?: MenuRow[]
    options: MenuScreenOption[]
    selectedIndex: number
    /** Options laid out in this many columns, row by row (1 by default); wide options take a whole row. */
    columns?: number
    hint?: string
    onSelect: (index:number) => void
    onHover: (index:number) => void
  }
</script>

<script lang="ts">
  import Dialog from "./ui/Dialog.svelte"
  import OptionButtons from "./ui/OptionButtons.svelte"

  /** An overlay lets the game show through (e.g. pause), otherwise the menu covers everything. */
  let { menu, isOverlay = false }:{
    menu: MenuScreenData
    isOverlay?: boolean
  } = $props()

  let options = $derived( menu.options.map( (option, index) => ({ ...option, isSelected:index === menu.selectedIndex }) ) )
</script>

<Dialog title={menu.title} subtitle={menu.subtitle} hint={menu.hint} {isOverlay}>
  {#if menu.rows?.length}
    <dl class="rows">
      {#each menu.rows as row (row.label)}
        <dt>{row.label}</dt>
        <dd>{row.value}</dd>
      {/each}
    </dl>
  {/if}

  <OptionButtons {options} columns={menu.columns} onSelect={menu.onSelect} onHover={menu.onHover} />
</Dialog>

<style>
  .rows {
    display: grid;
    grid-template-columns: auto auto;
    gap: 6px 24px;
    justify-content: center;
    margin: 20px 0 0;
    text-align: left;
  }

  .rows dt {
    color: #a8a29e;
  }

  .rows dd {
    margin: 0;
    font-weight: bold;
  }
</style>
