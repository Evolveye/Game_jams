<script module lang="ts">
  /** How an entry looks: a section heading, an instruction, or a quoted line. */
  export type BriefEntryVariant = `heading` | `note` | `quote`

  /** Part of an entry's text: plain text, or alternative keys shown as keyboard keys (`W` / `↑`). */
  export type BriefTextPart = string | { keys:string[] }

  /** One journal entry. All its content comes from the game; the journal only displays it. */
  export type BriefEntry = {
    id: number
    variant: BriefEntryVariant
    text: string | BriefTextPart[]
    /** Entries from the same source in a row are grouped closer together. */
    source: string
    /** Shown before the text, e.g. who says a line. */
    label?: string
    color?: string
  }
</script>

<script lang="ts">
  import { tick } from "svelte"
  import KeyCaps from "./ui/KeyCaps.svelte"

  /** Entries in the order they were added, the newest last. */
  let { title, entries }:{
    title: string,
    entries: BriefEntry[]
  } = $props()

  let list = $state<HTMLElement>()

  // Follows new entries, unless the player has scrolled up to read older ones.
  $effect.pre( () => {
    if (!list) return

    entries.length

    const isAtBottom = list.offsetHeight + list.scrollTop > list.scrollHeight - 20
    if (!isAtBottom) return

    tick().then( () => list?.scrollTo({ top:list.scrollHeight, behavior:`smooth` }) )
  } )

  function isContinuation( index:number ) {
    return index > 0 && entries[ index - 1 ].source === entries[ index ].source
  }

  function getParts( text:BriefEntry[ `text` ] ) {
    return typeof text === `string` ? [ text ] : text
  }
</script>

<!-- Inline content: kept on single lines, so no stray spaces appear between the parts. -->
{#snippet entryText( text:BriefEntry[ `text` ] )}
  {#each getParts( text ) as part}
    {#if typeof part === `string`}
      {part}
    {:else}
      <KeyCaps keys={part.keys} />
    {/if}
  {/each}
{/snippet}

<aside class="brief">
  <h2 class="title">{title}</h2>

  <ol class="entries" bind:this={list}>
    {#each entries as entry, index (entry.id)}
      <li class="entry entry-{entry.variant}" class:continuation={isContinuation( index )} style:--entry-color={entry.color}>
        {#if entry.label}
          <span class="label">{entry.label}</span>
        {/if}
        {#if entry.variant === `quote`}„{@render entryText( entry.text )}”{:else}{@render entryText( entry.text )}{/if}
      </li>
    {/each}
  </ol>
</aside>

<style>
  .brief {
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: #1c1917;
    border-left: 3px solid #8b5a2b;
    color: #f5f5f4;
    font-size: 15px;
  }

  /* Portrait screens: the journal is below the game. */
  @media (max-aspect-ratio: 1/1) {
    .brief {
      border-left: none;
      border-top: 3px solid #8b5a2b;
    }
  }

  .title {
    margin: 0;
    padding: 10px 14px;
    border-bottom: 1px solid #44403c;
    color: #e8c872;
    font-family: var(--font-title);
    font-size: 22px;
    font-weight: normal;
    letter-spacing: 0.05em;
  }

  .entries {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 8px 14px 14px;
    overflow-y: auto;
    list-style: none;
    scrollbar-color: #57534e transparent;
    scrollbar-width: thin;
  }

  /* A new source starts with a bigger gap. */
  .entry {
    margin-top: 14px;
    line-height: 1.5;
  }

  /* Consecutive entries from the same source stay close together. */
  .entry.continuation {
    margin-top: 4px;
  }

  .entry:first-child {
    margin-top: 4px;
  }

  .entry-heading {
    margin-top: 24px;
    color: var(--entry-color, #e8c872);
    font-family: var(--font-title);
    font-size: 19px;
  }

  /* Instructions: the most important entries, bright and marked. */
  .entry-note {
    position: relative;
    padding-left: 14px;
  }

  /* Outside the text flow, so wrapped lines align with the first one. */
  .entry-note::before {
    content: "▸";
    position: absolute;
    left: 0;
    color: #e8c872;
  }

  /* Spoken lines: already shown as subtitles, so here they are quieter and set apart. */
  .entry-quote {
    margin-left: 4px;
    padding-left: 10px;
    border-left: 2px solid var(--entry-color, #78716c);
    color: #a8a29e;
    font-size: 14px;
    font-style: italic;
  }

  .label {
    display: block;
    color: var(--entry-color, #a8a29e);
    font-size: 12px;
    font-style: normal;
    font-weight: bold;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
