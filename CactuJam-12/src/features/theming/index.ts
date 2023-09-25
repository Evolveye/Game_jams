import { ThemeFromConfig, createTheming } from "@lib/theming"

export const { createStylesHook, useTheme, themeConfig } = createTheming({
  state: {
    positiveColor: `#a5f46a`,
    negativeColor: `#ff0000`,
    backgroundColor: `#000000`,
  },
  atoms: ({ state }) => ({
    colors: {
      background: state.backgroundColor,
      positive: state.positiveColor,
      negative: state.negativeColor,
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
