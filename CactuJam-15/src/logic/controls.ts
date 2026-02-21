import Keys from "./Keys"

const controls = {
  up: [ Keys.getKeyCode( `w` ), Keys.getKeyCode( `up` ) ],
  down: [ Keys.getKeyCode( `s` ), Keys.getKeyCode( `down` ) ],
  left: [ Keys.getKeyCode( `a` ), Keys.getKeyCode( `left` ) ],
  right: [ Keys.getKeyCode( `d` ), Keys.getKeyCode( `right` ) ],
}

export default controls
