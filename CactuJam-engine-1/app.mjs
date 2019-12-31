/* Very simple server in vanilla node.js
 * Just run the file with command: node --experimental-modules app.mjs
 */

import Server from "./controller-server.mjs"

new Server( `./client` )