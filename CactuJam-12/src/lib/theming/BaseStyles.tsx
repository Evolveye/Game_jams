import { CSSProperties } from "./types"
import createStylesHook from "./createStylesHook"

export type GlobalsStyles = {
  "*"?: CSSProperties
  body?: CSSProperties
}

export type BaseStylesProps = {
  // stylesHook: UseStyles<any, any>
}

export default function BaseStyles() {
  useStyles()
  return null
}

const useStyles = createStylesHook({
  "@global": {
    "*": {
      boxSizing: `border-box`,
    },
    body: {
      margin: 0,
    },
  },
})
