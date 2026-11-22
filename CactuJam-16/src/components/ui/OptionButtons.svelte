<script module lang="ts">
  import type { ButtonVariant } from "./Button.svelte"

  /** `isWide`: takes a whole row when there are several columns. */
  export type OptionButton = { label:string, variant?:ButtonVariant, isSelected?:boolean, isWide?:boolean }
</script>

<script lang="ts">
  import Button from "./Button.svelte"

  /** A menu's options as buttons, in a column (or a grid of `columns`); the selection comes from the game. */
  let { options, columns = 1, onSelect, onHover }:{
    options: OptionButton[]
    columns?: number
    onSelect: (index:number) => void
    onHover?: (index:number) => void
  } = $props()
</script>

<ol class="options" style:--columns={columns}>
  {#each options as option, index (option.label)}
    <li class:wide={option.isWide}>
      <Button
        variant={option.variant}
        isSelected={option.isSelected}
        onclick={() => onSelect( index )}
        onhover={() => onHover?.( index )}
      >{option.label}</Button>
    </li>
  {/each}
</ol>

<style>
  /* The gap leaves room for the buttons' bottom edge, which is drawn below them. */
  .options {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 12px;
    margin: 24px 0 0;
    padding: 0;
    list-style: none;
  }

  .wide {
    grid-column: 1 / -1;
  }
</style>
