export default async function wait( seconds:number ) {
  await new Promise( r => setTimeout( r, 1000 * seconds ) )
}
