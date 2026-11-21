/** Who says a line. `id` groups their lines in the journal, `name` is shown before them. */
export type Speaker = { id:string, name?:string, color:string }

/** The player's own kid: no name before the lines. */
export const PLAYER:Speaker = { id:`player`, color:`#e7e5e4` }

export const KID:Speaker = { id:`kid`, name:`Dzieciak`, color:`#f9a8d4` }

export const MOM:Speaker = { id:`mom`, name:`Mama`, color:`#fdba74` }
