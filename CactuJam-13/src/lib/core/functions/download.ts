import { Primitive } from "../types"

export default function download( data:Blob | Primitive, filename:string = `data.txt`, type:string = `text/plain` ) {
  const a:HTMLAnchorElement = document.createElement( `a` )
  a.download = filename
  // a.href = `data:text/plain,` + data
  a.href = window.URL.createObjectURL( data instanceof Blob ? data : new Blob( [ data as BlobPart ], { type } ) )
  a.click()

  window.URL.revokeObjectURL( a.href )
}

export function downloadCSV( headers:string[], rows:(undefined | null | Primitive)[][], filename:string = `data.csv` ) {
  let str = headers.join( `; ` )

  str += rows.reduce( (str, row) => str + `\n` + row.join( `; ` ), `` )
  str += `\n`

  download( str, filename, `text/csv` )
}

export function downloadFile( filename:string, url:string ) {
  return fetch( url )
    .then( response => response.blob() )
    .then( blob => download( blob, filename ) )
    .catch( e => console.error( e ) )
}
