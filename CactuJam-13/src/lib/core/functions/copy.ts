import getWindow from "./getWindow"

export default async function copy( data:number | string ) {
  const clipboard = getWindow()?.navigator.clipboard

  if (typeof data !== `string`) data = `${data}`

  await clipboard?.writeText( data )
}
