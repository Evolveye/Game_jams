<script module lang="ts">
  import type { SpeechData } from "./ui/Speech.svelte"

  /** One line of a story over its picture. All content comes from the game. */
  export type SlideScreenData = {
    /** Changes with every line, so each one plays its entrance. */
    id: number
    /** Changes with every shot (picture with its lines), so its title plays its entrance once. */
    shotId: number
    /** URL of the background picture. Shots in a row with the same picture keep it on screen. */
    image?: string
    title?: string
    speech: SpeechData
    progress: string
    hint?: string
    onNext: () => void
  }
</script>

<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import Speech from "./ui/Speech.svelte"

  /** The slide to show; a new object with a new `id` moves to the next one. */
  let { slide }:{
    slide: SlideScreenData
  } = $props()
</script>

<!-- The whole screen is one big "next" button; the keyboard is handled by the game. -->
<button type="button" class="slide-screen" tabindex="-1" onclick={() => slide.onNext()}>
  <!-- Pictures cross-fade only when they change, so lines over the same picture don't flash it. -->
  {#key slide.image}
    {#if slide.image}
      <img class="background" src={slide.image} alt="" transition:fade|global={{ duration:500 }} />
    {/if}
  {/key}

  {#key slide.shotId}
    {#if slide.title}
      <h2 class="title" in:fade|global={{ duration:400 }}>{slide.title}</h2>
    {/if}
  {/key}

  {#key slide.id}
    <div class="dialog" in:fly|global={{ y:24, duration:500 }}>
      <Speech {...slide.speech} />
    </div>
  {/key}

  <span class="footer">
    <span>{slide.progress}</span>
    {#if slide.hint}
      <span>{slide.hint}</span>
    {/if}
  </span>
</button>

<style>
  .slide-screen {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: auto 1fr auto auto;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: none;
    background: #1c1917;
    color: #f5f5f4;
    font: inherit;
    cursor: pointer;
  }

  /* Pixel art: scaled up without blurring, cropped to fill the screen. */
  .background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: pixelated;
  }

  /* Everything else sits on top of the picture. */
  .title,
  .dialog,
  .footer {
    position: relative;
  }

  .title {
    grid-row: 1;
    justify-self: center;
    margin: 24px 0 0;
    padding: 0.2em 0.8em;
    border-radius: 0.3em;
    background: rgba(0, 0, 0, 0.55);
    color: #e8c872;
    font-family: var(--font-title);
    font-size: clamp(24px, 3.5vw, 40px);
    font-weight: normal;
  }

  .dialog {
    grid-row: 3;
    justify-self: center;
    max-width: min(80%, 900px);
    margin-bottom: 12px;
  }

  /* Darkened, so it stays readable over any picture. */
  .footer {
    grid-row: 4;
    display: flex;
    gap: 24px;
    justify-content: center;
    padding: 18px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
    color: #a8a29e;
    font-size: 13px;
  }
</style>
