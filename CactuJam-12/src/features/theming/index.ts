import { createTheming } from "@lib/theming"

export const { createStylesHook, useTheme, themeConfig } = createTheming({
  atoms: () => ({
    colors: {
      background: {
        main: `#000`,
      },

      a: `#a5f46a`,
      // a: `#ff0000`,
    },
  }),
})
