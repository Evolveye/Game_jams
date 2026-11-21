<script module lang="ts">
  /** `speech` for a line someone says, `narration` for story text nobody says. */
  export type SpeechVariant = `speech` | `narration`

  /** A line shown as a subtitle. All content comes from the game. */
  export type SpeechData = {
    text: string
    /** Shown above the text, e.g. who speaks. */
    label?: string
    color?: string
    variant?: SpeechVariant
  }
</script>

<script lang="ts">
  /** Subtitle box, the same in gameplay and in story slides. Its position is up to the parent. */
  let { text, label, color, variant = `speech` }:SpeechData = $props()
</script>

<p class="speech {variant}" style:color={color}>
  {#if label}
    <span class="label">{label}</span>
  {/if}
  {text}
</p>

<style>
  .speech {
    margin: 0;
    padding: 0.4em 1em;
    border-radius: 0.4em;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    font-size: clamp(14px, 2.4vw, 28px);
    font-weight: bold;
    text-align: center;
  }

  /* Nobody says it, so it reads as a quieter caption. */
  .narration {
    color: #e7e5e4;
    font-style: italic;
    font-weight: normal;
  }

  .label {
    display: block;
    font-family: var(--font-title);
    font-size: 0.7em;
    font-style: normal;
    font-weight: normal;
    letter-spacing: 0.05em;
  }
</style>
