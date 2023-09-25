import { createStylesHook } from "@fet/theming"
import CactuJam12Game from "@fet/game"

export default function HomePage() {
  useStyles()
  return <CactuJam12Game />
}

const useStyles = createStylesHook( ({ atoms }) => ({
  "@global": {
    "*": {
      boxSizing: `border-box`,
    },

    body: {
      margin: 0,
      backgroundColor: atoms.colors.background,
      fontFamily: `consolas`,
      fontSize: atoms.sizes.font.p,
    },

    h3: {
      fontSize: atoms.sizes.font.h3,
    },
  },
}) )
