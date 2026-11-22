<script module lang="ts">
  /** The "about the game" view: its text is written right here; the game only adds the way back. */
  export type AboutScreenData = {
    hint: string
    onBack: () => void
  }
</script>

<script lang="ts">
  import Dialog from "./ui/Dialog.svelte"
  import OptionButtons from "./ui/OptionButtons.svelte"

  let { data }:{
    data: AboutScreenData
  } = $props()
</script>

<Dialog title="O grze" subtitle="To MOJA piaskownica! — gra na CactuJam 16 (temat: „Sandbox”)" hint={data.hint}>
  <div class="content">
    <section>
      <h2>Autorzy</h2>
      <dl class="credits">
        <dt>Programowanie</dt>
        <dd>…</dd>

        <dt>Grafika</dt>
        <dd>…</dd>

        <dt>Dźwięk i muzyka</dt>
        <dd>…</dd>
      </dl>
    </section>

    <section>
      <h2>Podziękowania</h2>
      <p>…</p>
    </section>
  </div>

  <OptionButtons options={[ { label:`Wróć`, isSelected:true } ]} onSelect={data.onBack} />
</Dialog>

<style>
  .content {
    width: min(480px, 80vw);
    max-height: 50vh;
    margin: 20px 0 0;
    overflow-y: auto;
    text-align: left;
  }

  h2 {
    margin: 16px 0 8px;
    color: #e8c872;
    font-size: 17px;
  }

  .credits {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 24px;
    margin: 0;
  }

  .credits dt {
    color: #a8a29e;
  }

  .credits dd {
    margin: 0;
    font-weight: bold;
  }
</style>
