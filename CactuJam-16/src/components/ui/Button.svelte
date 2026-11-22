<script module lang="ts">
  /** `danger`: an action that can't be undone, e.g. deleting saved data. */
  export type ButtonVariant = `primary` | `secondary` | `danger`
</script>

<script lang="ts">
  import type { Snippet } from "svelte"

  let { variant = `secondary`, isSelected = false, onclick, onhover, children }:{
    variant?: ButtonVariant
    isSelected?: boolean
    onclick: () => void
    onhover?: () => void
    children: Snippet
  } = $props()
</script>

<button
  type="button"
  class="button {variant}"
  class:selected={isSelected}
  tabindex="-1"
  {onclick}
  onmousemove={onhover}
>
  {@render children()}
</button>

<style>
  .button {
    --edge-height: 4px;
    --edge-color: transparent;
    --ring: 0 0 0 0 transparent;

    width: 100%;
    padding: 10px 16px;
    border: 2px solid var(--edge-color);
    border-radius: 6px;
    box-shadow: 0 var(--edge-height) 0 var(--edge-color), var(--ring);
    font: inherit;
    font-size: 17px;
    cursor: pointer;
    transition: background-color 0.12s, border-color 0.12s, box-shadow 0.06s, color 0.12s, transform 0.06s;
  }

  /* Pressed: pushed down onto its bottom edge. */
  .button:active {
    --edge-height: 2px;

    transform: translateY(2px);
  }

  .secondary {
    --edge-color: #44403c;

    background: #1c1917;
    color: #d6d3d1;
  }

  .secondary:hover {
    --edge-color: #78716c;

    background: #292524;
    color: #f5f5f4;
  }

  .secondary.selected {
    --edge-color: #e8c872;

    background: #3f3a2e;
    color: #f5f5f4;
  }

  .danger {
    --edge-color: #44403c;

    background: #1c1917;
    color: #f87171;
  }

  .danger:hover {
    --edge-color: #7f1d1d;

    background: #2a1414;
    color: #fca5a5;
  }

  .danger.selected {
    --edge-color: #ef4444;

    background: #3b1717;
    color: #fecaca;
  }

  .primary {
    --edge-color: #a16207;

    background: #e8c872;
    color: #1c1917;
    font-weight: bold;
  }

  .primary:hover {
    --edge-color: #854d0e;

    background: #f5d98c;
  }

  /* Selected primary keeps its color and gets a ring, so it still reads as the main action. */
  .primary.selected {
    --ring: 0 0 0 4px rgba(232, 200, 114, 0.35);
  }
</style>
