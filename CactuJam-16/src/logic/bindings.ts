import type Game from "../Game"
import type { ActionOf, KeyCode } from "./engine"
import { loadFromStorage, removeFromStorage, saveToStorage } from "./storage"

type GameControls = typeof Game.controls
type GameAction = ActionOf<GameControls>

/** Keys per action the player can set (a main one and an alternative). */
export const SLOTS_PER_ACTION = 2

/** The actions shown in the controls view, in order, with their names for players. Debug keys stay hidden. */
export const REBINDABLE_ACTIONS: { action:GameAction, label:string }[] = [
  { action:`moveUp`, label:`Ruch w górę` },
  { action:`moveDown`, label:`Ruch w dół` },
  { action:`moveLeft`, label:`Ruch w lewo` },
  { action:`moveRight`, label:`Ruch w prawo` },
  { action:`switchPace`, label:`Bieg / chód (przytrzymaj)` },
  { action:`useToy`, label:`Użyj zabawki` },
  { action:`prevToy`, label:`Poprzednia zabawka` },
  { action:`nextToy`, label:`Następna zabawka` },
  { action:`swapToy`, label:`Zamień zabawkę` },
  { action:`pause`, label:`Pauza` },
  { action:`confirm`, label:`Zatwierdź (menu)` },
]

/**
 * Actions used at the same time, so they must not share a key. Gameplay and menus are separate,
 * so e.g. Space can both use a toy and confirm in menus; menus also move with the up and down keys.
 */
const CONFLICT_GROUPS: GameAction[][] = [
  [ `moveUp`, `moveDown`, `moveLeft`, `moveRight`, `switchPace`, `useToy`, `prevToy`, `nextToy`, `swapToy`, `pause` ],
  [ `moveUp`, `moveDown`, `confirm` ],
]

const STORAGE_KEY = `controls`

/** Applies the player's saved keys, if any. */
export function loadSavedBindings( controls:GameControls ) {
  controls.rebindAll( loadFromStorage( STORAGE_KEY, {} ) )
}

export function saveBindings( controls:GameControls ) {
  saveToStorage( STORAGE_KEY, controls.getAllBindings() )
}

export function resetBindings( controls:GameControls ) {
  controls.resetBindings()
  removeFromStorage( STORAGE_KEY )
}

/**
 * Puts the key in the action's slot and saves it. A conflicting action that had this key gets the slot's previous key
 * instead (the two swap), so no key ever does two things at once.
 * Refuses when that would leave the other action with no key at all, and returns that action (otherwise `null`).
 */
export function bindKey( controls:GameControls, action:GameAction, slot:number, code:KeyCode ) {
  const codes = controls.getBindings( action )
  const previousCode = codes[ slot ]
  const otherRebinds = [ ...getConflictingActions( action ) ]
    .filter( otherAction => controls.getBindings( otherAction ).includes( code ) )
    .map( otherAction => ({ otherAction, otherCodes:replaceCode( controls.getBindings( otherAction ), code, previousCode ) }) )

  const keyless = otherRebinds.find( ({ otherCodes }) => !otherCodes.length )
  if (keyless) return keyless.otherAction

  for (const { otherAction, otherCodes } of otherRebinds) controls.rebind( otherAction, otherCodes )

  // The same key in the action's other slot swaps too.
  const newCodes = codes.map( existing => existing === code ? previousCode : existing )
  newCodes[ slot ] = code

  controls.rebind( action, getUniqueCodes( newCodes ) )
  saveBindings( controls )

  return null
}

/** The player's name of an action, e.g. for messages. */
export function getActionLabel( action:GameAction ) {
  return REBINDABLE_ACTIONS.find( entry => entry.action === action )?.label ?? action
}

/** Empties the slot and saves it, unless it holds the action's last key (every action keeps at least one). */
export function clearKey( controls:GameControls, action:GameAction, slot:number ) {
  const codes = controls.getBindings( action )
  if (codes.length <= 1 || slot >= codes.length) return false

  codes.splice( slot, 1 )
  controls.rebind( action, codes )
  saveBindings( controls )

  return true
}

/** Actions sharing a conflict group with this one. */
function getConflictingActions( action:GameAction ) {
  const groups = CONFLICT_GROUPS.filter( group => group.includes( action ) )
  return new Set( groups.flat().filter( otherAction => otherAction !== action ) )
}

/** The codes with `code` replaced by `replacement`, or without it when there is none. */
function replaceCode( codes:KeyCode[], code:KeyCode, replacement:undefined | KeyCode ) {
  return getUniqueCodes( codes.map( existing => existing === code ? replacement : existing ) )
}

/** The codes without gaps and repeats, in order. */
function getUniqueCodes( codes:(undefined | KeyCode)[] ) {
  return [ ...new Set( codes.filter( code => code !== undefined ) ) ]
}
