import { createStylesHook } from "@fet/theming"
import CactuJam11 from "@fet/CactuJam11"

export default function GameSection() {
  const [ classes ] = useStyles()

  return (
    <main className={classes.page}>
      <CactuJam11 />
    </main>
  )
}

const useStyles = createStylesHook({
  "@global": {
    body: {
      margin: 0,
    },
  },

  page: {
    backgroundColor: `#000`,
    height: `100vh`,
    width: `100%`,
    color: `white`,
  },
})
