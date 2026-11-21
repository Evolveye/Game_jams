<script lang="ts">
  let canvas: HTMLCanvasElement
  let speech = $state<null | string>( null )

  export function getCanvas() {
    return canvas
  }

  export function getSpeech() {
    return speech
  }

  export function setSpeech( text:null | string ) {
    speech = text
  }
</script>

<canvas class="game-canvas" bind:this={canvas}></canvas>

<div class="hud">
  {#if speech}
    <p class="speech">{speech}</p>
  {/if}
</div>

<style>
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
</style>
