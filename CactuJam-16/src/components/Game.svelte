<script lang="ts">
  let canvas: HTMLCanvasElement

  export function getCanvas() {
    return canvas
  }
</script>

<canvas class="game-canvas" bind:this={canvas}></canvas>
<div class="hud"></div>

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
</style>
