import { ThemeFromConfig, createTheming } from "@lib/theming"

export const { createStylesHook, useTheme, themeConfig } = createTheming({
  atoms: () => ({
    colors: {
      background: {
        main: `#000`,
      },

      positive: `#a5f46a`,
      negative: `#ff0000`,
    },

    sizes: {
      border: {
        width: 2,
      },

      font: {
        h3: 20,
        p: 12,
        small: 11,
      },
    },

    spacing: {
      main: 20,
      small: 10,
    },
  }),
})

export type Theme = ThemeFromConfig<typeof themeConfig>
