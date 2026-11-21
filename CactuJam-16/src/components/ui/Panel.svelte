<script lang="ts">
  import type { Snippet } from "svelte"

  /** Bordered box for menus and dialogs. A translucent panel lets the game below show through a little. */
  let { isTranslucent = false, children }:{
    isTranslucent?: boolean
    children: Snippet
  } = $props()
</script>

<div class="panel" class:translucent={isTranslucent}>
  {@render children()}
</div>

<style>
  .panel {
    min-width: min(360px, 90vw);
    padding: 28px 32px;
    border: 3px solid #8b5a2b;
    border-radius: 10px;
    background: #292524;
    color: #f5f5f4;
    text-align: center;
  }

  .panel.translucent {
    background: rgba(41, 37, 36, 0.92);
  }
</style>
