<script lang="ts">
  import KeyCap from "./KeyCap.svelte"

  /** Alternative keys for the same thing, e.g. `Space` / `LMB`. */
  let { keys }:{
    keys: string[]
  } = $props()
</script>

<!-- Kept on one line, so no stray spaces appear around the separators. -->
{#each keys as key, index (key)}{#if index}<span class="separator">/</span>{/if}<KeyCap label={key} />{/each}

<style>
  .separator {
    margin: 0 3px;
    color: #78716c;
  }
</style>
