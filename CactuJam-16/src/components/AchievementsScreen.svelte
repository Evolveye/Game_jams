<script module lang="ts">
  /** One achievement; `unlockedAt` is a ready-to-show date, `null` while it is locked. */
  export type AchievementEntry = { id:string, name:string, description:string, unlockedAt:null | string }

  /** The player's achievements, unlocked and locked. All content comes from the game. */
  export type AchievementsScreenData = {
    achievements: AchievementEntry[]
    hint: string
    onBack: () => void
  }
</script>

<script lang="ts">
  import Dialog from "./ui/Dialog.svelte"
  import OptionButtons from "./ui/OptionButtons.svelte"

  let { data }:{
    data: AchievementsScreenData
  } = $props()

  let unlockedCount = $derived( data.achievements.filter( achievement => achievement.unlockedAt ).length )
</script>

<Dialog title="Osiągnięcia" subtitle="Zdobyte: {unlockedCount} z {data.achievements.length}" hint={data.hint}>
  <ul class="list">
    {#each data.achievements as achievement (achievement.id)}
      <li class="achievement" class:unlocked={achievement.unlockedAt}>
        <span class="badge">{achievement.unlockedAt ? `★` : `☆`}</span>

        <div class="texts">
          <strong class="name">{achievement.name}</strong>
          <span class="description">{achievement.description}</span>
        </div>

        <span class="date">{achievement.unlockedAt ?? `Zablokowane`}</span>
      </li>
    {/each}
  </ul>

  <OptionButtons options={[ { label:`Wróć`, isSelected:true } ]} onSelect={data.onBack} />
</Dialog>

<style>
  .list {
    display: grid;
    gap: 8px;
    width: min(480px, 80vw);
    max-height: 50vh;
    margin: 20px 0 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    text-align: left;
  }

  .achievement {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    padding: 10px 12px;
    border: 2px solid #44403c;
    border-radius: 6px;
    background: #1c1917;
    color: #78716c;
  }

  .achievement.unlocked {
    border-color: #a16207;
    background: #3f3a2e;
    color: #f5f5f4;
  }

  .badge {
    font-size: 22px;
  }

  .achievement.unlocked .badge {
    color: #e8c872;
  }

  .texts {
    display: grid;
    gap: 2px;
  }

  .description {
    font-size: 14px;
  }

  .date {
    font-size: 13px;
    white-space: nowrap;
  }
</style>
