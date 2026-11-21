<script lang="ts">
  /** One key, drawn like a keyboard key. */
  let { label }:{
    label: string
  } = $props()
</script>

<kbd class="key-cap">{label}</kbd>

<style>
  .key-cap {
    display: inline-block;
    margin: 0 1px;
    padding: 0 5px;
    border: 1px solid #a16207;
    border-bottom-width: 3px;
    border-radius: 4px;
    background: #e8c872;
    color: #1c1917;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.85em;
    font-style: normal;
    font-weight: bold;
    line-height: 1.4;
  }
</style>
