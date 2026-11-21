<script module lang="ts">
  import type { ButtonVariant } from "./ui/Button.svelte"

  export type MenuRow = { label:string, value:string }
  export type MenuScreenOption = { label:string, variant?:ButtonVariant }

  /** A menu: title, optional summary rows, and options. All content comes from the game. */
  export type MenuScreenData = {
    title: string
    subtitle?: string
    rows?: MenuRow[]
    options: MenuScreenOption[]
    selectedIndex: number
    hint?: string
    onSelect: (index:number) => void
    onHover: (index:number) => void
  }
</script>

<script lang="ts">
  import Button from "./ui/Button.svelte"
  import Panel from "./ui/Panel.svelte"

  /** An overlay lets the game show through (e.g. pause), otherwise the menu covers everything. */
  let { menu, isOverlay = false }:{
    menu: MenuScreenData
    isOverlay?: boolean
  } = $props()
</script>

<div class="menu-screen" class:overlay={isOverlay}>
  <Panel isTranslucent={isOverlay}>
    <h1 class="title">{menu.title}</h1>

    {#if menu.subtitle}
      <p class="subtitle">{menu.subtitle}</p>
    {/if}

    {#if menu.rows?.length}
      <dl class="rows">
        {#each menu.rows as row (row.label)}
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        {/each}
      </dl>
    {/if}

    <ol class="options">
      {#each menu.options as option, index (option.label)}
        <li>
          <Button
            variant={option.variant}
            isSelected={index === menu.selectedIndex}
            onclick={() => menu.onSelect( index )}
            onhover={() => menu.onHover( index )}
          >{option.label}</Button>
        </li>
      {/each}
    </ol>

    {#if menu.hint}
      <p class="hint">{menu.hint}</p>
    {/if}
  </Panel>
</div>

<style>
  .menu-screen {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: #1c1917;
  }

  .menu-screen.overlay {
    background: rgba(12, 10, 9, 0.6);
    backdrop-filter: blur(2px);
  }

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

  /* The gap leaves room for the buttons' bottom edge, which is drawn below them. */
  .options {
    display: grid;
    gap: 12px;
    margin: 24px 0 0;
    padding: 0;
    list-style: none;
  }

  .hint {
    margin: 18px 0 0;
    color: #78716c;
    font-size: 13px;
  }
</style>
