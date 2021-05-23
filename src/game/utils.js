export function getDate( date = Date.now(), format = `YYYY.MM.DD hh:mm` ) {
  if (typeof date != `number`) date = new Date(date)

  const options = {
    year: `numeric`,
    month: `2-digit`,
    day: `2-digit`,
    hour: `2-digit`,
    minute: `2-digit`,
  }
  const [
    { value:DD },
    ,
    { value:MM },
    ,
    { value:YYYY },
    ,
    { value:hh },
    ,
    { value:mm },
  ] = new Intl.DateTimeFormat(`pl`, options).formatToParts( date )

  return `${format}`
    .replace( /YYYY/, YYYY )
    .replace( /YY/, YYYY.slice( -2 ) )
    .replace( /MM/, MM )
    .replace( /DD/, DD )
    .replace( /hh/, hh )
    .replace( /mm/, mm )
}
