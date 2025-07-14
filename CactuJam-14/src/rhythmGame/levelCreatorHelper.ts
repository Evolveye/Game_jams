/* eslint-disable sonarjs/no-commented-code */



/*\
 *  Helper for creating music tiles. It was running directly in the browser
\*/



// timer = Date.now()
// entries = []

// setupDone = typeof setupDone !== `undefined` ? setupDone : false
// if (!setupDone) {
//   setupDone = true
//   const keysMap = new Map()

//   window.addEventListener( `keydown`, e => {
//     if (keysMap.has( e.code )) return

//     const start = Date.now() - timer
//     keysMap.set( e.code, start )
//   } )

//   window.addEventListener( `keyup`, e => {
//     const start = keysMap.get( e.code )
//     const obj = { timeMs:start, lasts:(Date.now() - timer) - start, keys:e.code }

//     console.log( obj )

//     entries.push( obj )
//     keysMap.delete( e.code )
//   } )
// }

// game.rhythmGame.audio.pixelFantasia.play()

// //

// str = entries.reduce( (str, obj, i) => {
//   const lasts = obj.lasts <= 200 ? 0 : Math.floor( obj.lasts / 100 ) * 100

//   return str
//     + `{ timeMs:${obj.timeMs}, `
//     + (lasts > 0 ? `lasts:${lasts}, ` : ``)
//     + (i % 2 ? `...leftDefaults` : `...rightDefaults`)
//     + ` },\n`
// }, `` )

// console.log( str )
