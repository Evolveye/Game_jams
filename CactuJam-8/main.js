const { app, BrowserWindow } = require( `electron` )

app.whenReady().then( main )

function main() {
  const win = new BrowserWindow( {
    width: 1050,
    height: 650,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    }
  } )

  win.setResizable( false )
  win.removeMenu()
  win.loadFile( `./views/index.html` )
}
