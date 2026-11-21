import { SOUNDS } from "./sounds"

/**
 * Who says a line. `id` groups their lines in the journal, `name` is shown before them,
 * `voice` is played with each line (unless the line has its own sound).
 */
export type Speaker = { id:string, name?:string, color:string, voice?:string }

/** The player's own kid: no name before the lines. */
export const PLAYER:Speaker = { id:`player`, color:`#e7e5e4`, voice:SOUNDS.voicePlayer }

export const KID:Speaker = { id:`kid`, name:`Dzieciak`, color:`#f9a8d4`, voice:SOUNDS.voiceKid }

export const MOM:Speaker = { id:`mom`, name:`Mama`, color:`#fdba74`, voice:SOUNDS.voiceMom }
