const { app, BrowserWindow } = require( `electron` )

app.whenReady().then( main )

function main() {
  const win = new BrowserWindow( {
    width: 1000,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    }
  } )

  win.loadFile( `./views/index.html` )
}
