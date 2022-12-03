const logger = {
  logDev( ...params ) {
    console.log( `%c dev `, `background-color:yellow; color:black; font-weight:bold`, ...params )
  },
}

export default logger
