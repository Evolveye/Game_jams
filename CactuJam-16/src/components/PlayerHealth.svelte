<script module lang="ts">
  /** The player's health. All content comes from the game; the view only displays it. */
  export type PlayerHealthData = { current:number, max:number }
</script>

<script lang="ts">
  /** Health as a row of hearts: full ones are left, empty ones are lost. */
  let { current, max }:PlayerHealthData = $props()
</script>

<ol class="hearts">
  {#each { length:max }, index}
    <li class="heart" class:empty={index >= current}>
      <svg viewBox="0 0 7 6" shape-rendering="crispEdges">
        <path d="M1 0h2v1h1V0h2v1h1v2h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1H0V1h1z" />
      </svg>
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

  .heart svg {
    display: block;
    width: clamp(16px, 1.6vw, 22px);
    fill: #ef4444;
  }

  /* A heart just lost pops and shakes; the animation runs when the class is added. */
  .heart.empty svg {
    fill: #57534e;
    animation: lose-heart 0.4s;
  }

  @keyframes lose-heart {
    0% {
      fill: #fca5a5;
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
