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

export function fancyTimeFormat( time, isTimeWithMiliseconds = true ) {
  const duration = Math.floor( isTimeWithMiliseconds ? time / 1000 : time )

  const ms = time % 1000
  const ss = duration % 60
  const mm = ~~((duration % 3600) / 60)
  const hh = ~~(duration / 3600)

  // Output like "1:01" or "4:03:59" or "123:03:59" or "1:01.123" or "123:03:59.1234"
  let output = ``

  if (hh > 0) {
    output += hh + `:`
  }

  output += mm + `:`
  output += (ss < 10 ? `0` : ``) + ss

  if (isTimeWithMiliseconds) output += `.` + ms

  return output
}
