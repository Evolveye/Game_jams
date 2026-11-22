<script lang="ts">
  import type { Snippet } from "svelte"

  /** Covers the whole game, centering its content. An overlay lets the game show through (e.g. pause). */
  let { isOverlay = false, children }:{
    isOverlay?: boolean
    children: Snippet
  } = $props()
</script>

<div class="screen" class:overlay={isOverlay}>
  {@render children()}
</div>

<style>
  /* Scrolls when the content is taller than the screen. */
  .screen {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    overflow-y: auto;
    background: #1c1917;
  }

  .screen.overlay {
    background: rgba(12, 10, 9, 0.6);
    backdrop-filter: blur(2px);
  }
</style>
