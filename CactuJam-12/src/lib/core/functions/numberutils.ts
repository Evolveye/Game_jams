export function randomInt(max:number)
export function randomInt( min:number, max:number )
export function randomInt( minOrMax:number, max?:number ) {
  let min = max === undefined ? 0 : minOrMax
  max = max === undefined ? minOrMax : max

  if (min > max) [ min, max ] = [ max, min ]

  return Math.floor( Math.random() * (max - min + 1) + min )
}
