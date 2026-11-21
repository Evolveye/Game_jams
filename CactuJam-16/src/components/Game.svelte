<script lang="ts">
  import Brief, { type BriefEntry } from "./Brief.svelte"

  /** A line under the game. `label` (e.g. who speaks) is shown above the text. */
  type Speech = { text:string, label?:string, color?:string }

  /** Title of the journal next to the game. */
  let { briefTitle }:{ briefTitle:string } = $props()

  let canvas: HTMLCanvasElement
  // Raw (not proxied): `say()` compares the stored object with its own by identity to know whether to hide it.
  let speech = $state.raw<null | Speech>( null )
  let briefEntries = $state<BriefEntry[]>([])
  let nextBriefEntryId = 0

  export function getCanvas() {
    return canvas
  }

  export function getSpeech() {
    return speech
  }

  /** Shows a subtitle, or hides it with `null`. */
  export function setSpeech( newSpeech:null | Speech ) {
    speech = newSpeech
  }

  /** Adds an entry to the journal next to the game. */
  export function addBriefEntry( entry:Omit<BriefEntry, `id`> ) {
    briefEntries.push({ ...entry, id:nextBriefEntryId++ })
  }
</script>

<div class="layout">
  <div class="stage">
    <canvas class="game-canvas" bind:this={canvas}></canvas>

    <div class="hud">
      {#if speech}
        <p class="speech" style:color={speech.color}>
          {#if speech.label}
            <span class="speech-label">{speech.label}</span>
          {/if}
          {speech.text}
        </p>
      {/if}
    </div>
  </div>

  <Brief title={briefTitle} entries={briefEntries} />
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: 1fr clamp(220px, 24vw, 360px);
    height: 100%;
  }

  /* Portrait screens: the journal goes below the game. */
  @media (max-aspect-ratio: 1/1) {
    .layout {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 30%;
    }
  }

  .stage {
    position: relative;
    min-width: 0;
    min-height: 0;
  }

  .game-canvas,
  .hud {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hud {
    pointer-events: none;
  }

  .speech {
    position: absolute;
    left: 50%;
    bottom: 6%;
    transform: translateX(-50%);
    margin: 0;
    padding: 0.4em 1em;
    max-width: 80%;
    border-radius: 0.4em;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    font-size: clamp(14px, 2.4vw, 28px);
    font-weight: bold;
    text-align: center;
  }

  .speech-label {
    display: block;
    font-family: var(--font-title);
    font-size: 0.7em;
    font-weight: normal;
    letter-spacing: 0.05em;
  }
</style>
