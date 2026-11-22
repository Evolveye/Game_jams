<script lang="ts">
  import type { Snippet } from "svelte"
  import Panel from "./Panel.svelte"
  import Screen from "./Screen.svelte"

  /**
   * A panel over the whole screen: title, optional subtitle, the content, and an optional hint at the bottom
   * (e.g. the keys). Shared by menus and the views opened from them.
   */
  let { title, subtitle, hint, isOverlay = false, children }:{
    title: string
    subtitle?: string
    hint?: string
    isOverlay?: boolean
    children: Snippet
  } = $props()
</script>

<Screen {isOverlay}>
  <Panel isTranslucent={isOverlay}>
    <h1 class="title">{title}</h1>

    {#if subtitle}
      <p class="subtitle">{subtitle}</p>
    {/if}

    {@render children()}

    {#if hint}
      <p class="hint">{hint}</p>
    {/if}
  </Panel>
</Screen>

<style>
  .title {
    margin: 0;
    color: #e8c872;
    font-family: var(--font-title);
    font-size: clamp(26px, 4vw, 44px);
    font-weight: normal;
    letter-spacing: 0.04em;
  }

  .subtitle {
    margin: 8px 0 0;
    color: #a8a29e;
  }

  .hint {
    margin: 18px 0 0;
    color: #78716c;
    font-size: 13px;
  }
</style>
