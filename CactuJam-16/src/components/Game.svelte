<script module lang="ts">
  import type { AboutScreenData } from "./AboutScreen.svelte"
  import type { AchievementsScreenData } from "./AchievementsScreen.svelte"
  import type { ControlsScreenData } from "./ControlsScreen.svelte"
  import type { MenuScreenData } from "./MenuScreen.svelte"
  import type { SlideScreenData } from "./SlideScreen.svelte"

  /** A screen covering the whole game (gameplay shows when there is none). */
  export type Screen =
    | ({ kind:`menu` } & MenuScreenData)
    | ({ kind:`slide` } & SlideScreenData)
    | ({ kind:`achievements` } & AchievementsScreenData)
    | ({ kind:`about` } & AboutScreenData)
    | ({ kind:`controls` } & ControlsScreenData)
</script>

<script lang="ts">
  import AboutScreen from "./AboutScreen.svelte"
  import AchievementsScreen from "./AchievementsScreen.svelte"
  import Brief, { type BriefEntry } from "./Brief.svelte"
  import ControlsScreen from "./ControlsScreen.svelte"
  import Inventory, { type InventorySlot } from "./Inventory.svelte"
  import MenuScreen from "./MenuScreen.svelte"
  import PlayerHealth, { type PlayerHealthData } from "./PlayerHealth.svelte"
  import SlideScreen from "./SlideScreen.svelte"
  import Speech, { type SpeechData } from "./ui/Speech.svelte"

  /** Title of the journal next to the game. */
  let { briefTitle }:{
    briefTitle: string
  } = $props()

  let canvas: HTMLCanvasElement
  // Raw (not proxied): `say()` compares the stored object with its own by identity to know whether to hide it.
  let speech = $state.raw<null | SpeechData>( null )
  let briefEntries = $state<BriefEntry[]>([])
  let nextBriefEntryId = 0
  // Raw: always replaced as a whole when the inventory changes, never edited in place.
  let inventorySlots = $state.raw<InventorySlot[]>([])
  // Raw: replaced as a whole when health changes.
  let playerHealth = $state.raw<null | PlayerHealthData>( null )
  // Raw: replaced as a whole by the game's scenes.
  let screen = $state.raw<null | Screen>( null )
  let overlay = $state.raw<null | MenuScreenData>( null )

  export function getCanvas() {
    return canvas
  }

  export function getSpeech() {
    return speech
  }

  /** Shows a subtitle, or hides it with `null`. */
  export function setSpeech( newSpeech:null | SpeechData ) {
    speech = newSpeech
  }

  /** Adds an entry to the journal next to the game. */
  export function addBriefEntry( entry:Omit<BriefEntry, `id`> ) {
    briefEntries.push({ ...entry, id:nextBriefEntryId++ })
  }

  /** Empties the journal, e.g. for a new run. */
  export function clearBrief() {
    briefEntries = []
  }

  /** Shows the player's items over the game. */
  export function setInventory( slots:InventorySlot[] ) {
    inventorySlots = slots
  }

  /** Shows the player's health over the game. */
  export function setPlayerHealth( health:PlayerHealthData ) {
    playerHealth = health
  }

  /** Covers the game with a menu or a story slide; `null` shows the gameplay. */
  export function setScreen( newScreen:null | Screen ) {
    screen = newScreen
  }

  /** Shows a menu over the game, which stays visible below it (pause, game over); `null` hides it. */
  export function setOverlay( newOverlay:null | MenuScreenData ) {
    overlay = newOverlay
  }
</script>

<div class="layout">
  <div class="stage">
    <canvas class="game-canvas" bind:this={canvas}></canvas>

    <div class="hud">
      {#if playerHealth}
        <div class="hud-health">
          <PlayerHealth {...playerHealth} />
        </div>
      {/if}

      <div class="hud-inventory">
        <Inventory slots={inventorySlots} />
      </div>

      {#if speech}
        <div class="subtitle">
          <Speech {...speech} />
        </div>
      {/if}
    </div>
  </div>

  <Brief title={briefTitle} entries={briefEntries} />
</div>

{#if screen?.kind === `menu`}
  <MenuScreen menu={screen} />
{:else if screen?.kind === `slide`}
  <SlideScreen slide={screen} />
{:else if screen?.kind === `achievements`}
  <AchievementsScreen data={screen} />
{:else if screen?.kind === `about`}
  <AboutScreen data={screen} />
{:else if screen?.kind === `controls`}
  <ControlsScreen data={screen} />
{/if}

{#if overlay}
  <MenuScreen menu={overlay} isOverlay />
{/if}

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

  /* Clicks aim, so the cursor shows where. */
  .game-canvas {
    cursor: crosshair;
  }

  .hud {
    pointer-events: none;
  }

  .hud-health {
    position: absolute;
    top: 10px;
    left: 10px;
  }

  /* In the bottom-left corner, beside the subtitles in the middle. */
  .hud-inventory {
    position: absolute;
    bottom: 10px;
    left: 10px;
  }

  /* Centered within 80% of the width, so long lines wrap there and not at half the screen.
     Kept above the inventory row, so a long line never covers it. */
  .subtitle {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: max(6%, 84px);
    display: flex;
    justify-content: center;
  }
</style>
