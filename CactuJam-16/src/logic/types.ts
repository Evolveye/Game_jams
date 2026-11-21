// Placeholder file. Should be splitted into its own directories (entities or something)

export type ToyKind = `spade` | `bucket` | `moulds` | `wateringCan`
export type EnemyKind = `grabber` | `crybaby` | `bigKid` | `toddler`

export type Enemy = { kind:EnemyKind, x:number, y:number }
