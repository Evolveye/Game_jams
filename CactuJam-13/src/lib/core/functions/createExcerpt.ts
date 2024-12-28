export default function createExcerpt( longExcerpt:string, length = 150 ) {
  const excerptPhrases = longExcerpt
    .replace( /\n|\r\n/g, `<br />` )
    .split( /\.(?: |<br>|<br *?\/>|$|&nbsp;)+/g )

  let newExcerpt = (excerptPhrases.shift() ?? ``).replace( /<br>|<br *?\/>/g, ` ` )

  while (newExcerpt.length < length && excerptPhrases.length) {
    newExcerpt += `. ` + (excerptPhrases.shift() ?? ``).replace( /<br>|<br *?\/>/g, ` ` )
  }

  if (newExcerpt.length > length) {
    while (newExcerpt.length > length) {
      newExcerpt = newExcerpt.match( /(.*) \w+/ )![ 1 ]
    }

    newExcerpt += `...`
  }

  return newExcerpt
}
