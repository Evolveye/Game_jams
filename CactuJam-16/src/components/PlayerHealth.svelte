<script module lang="ts">
  /** The player's health and the heart images (URLs). All content comes from the game; the view only displays it. */
  export type PlayerHealthData = { current:number, max:number, icons:{ full:string, empty:string } }
</script>

<script lang="ts">
  /** Health as a row of hearts: full ones are left, empty ones are lost. */
  let { current, max, icons }:PlayerHealthData = $props()
</script>

<ol class="hearts">
  {#each { length:max }, index}
    {@const isEmpty = index >= current}
    <li class="heart" class:empty={isEmpty}>
      <img src={isEmpty ? icons.empty : icons.full} alt="" />
    </li>
  {/each}
</ol>

<style>
  .hearts {
    display: flex;
    gap: 4px;
    margin: 0;
    padding: 5px 8px;
    border: 2px solid #44403c;
    border-radius: 6px;
    background: rgba(28, 25, 23, 0.8);
    list-style: none;
  }

  /* Pixel art: scaled up without blurring. */
  .heart img {
    display: block;
    width: clamp(16px, 1.6vw, 22px);
    image-rendering: pixelated;
  }

  /* A heart just lost pops and shakes; the animation runs when the class is added. */
  .heart.empty img {
    animation: lose-heart 0.4s;
  }

  @keyframes lose-heart {
    0% {
      transform: scale(1.5);
    }

    40% {
      transform: scale(1.1) translateX(-2px);
    }

    70% {
      transform: translateX(2px);
    }

    100% {
      transform: none;
    }
  }
</style>
