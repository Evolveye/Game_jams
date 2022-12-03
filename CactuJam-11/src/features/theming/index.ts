import { createTheming } from "@lib/theming"

export const { createStylesHook, themeConfig } = createTheming({
  atoms: () => ({
    colors: {
      rest: {
        green: `#5da234`,
        red: `tomato`,
      },
      background: {
        dark: `#202022`,
        light: `#22232a`,
        main: `#212226`,
        text: `#eaeaea`,
      },
      surface: {
        main: `#05051055`,
        text: `#eaeaea`,
      },
    },

    spacing: {
      main: 20,
    },

    sizes: {
      borderWidth: 2,
      font: {
        regular: 14,
        high: 18,
      },
    },

    breakpoints: {
      mobile: {
        stop: 511,
        get mediaQuery() {
          const stop = this.stop as number
          return `@media (max-width: ${stop}px)`
        },
      },
      bigMobile: {
        start: 512,
        stop: 749,
        get mediaQuery() {
          const start = this.start as number
          const stop = this.stop as number
          return `@media (min-width:${start}px) and (max-width:${stop}px)`
        },
        get mediaQueryMax() {
          const stop = this.stop as number
          return `@media (max-width:${stop}px)`
        },
      },
      tablet: {
        start: 750,
        stop: 1049,
        get mediaQuery() {
          const start = this.start as number
          const stop = this.stop as number
          return `@media (min-width:${start}px) and (max-width:${stop}px)`
        },
        get mediaQueryMin() {
          const start = this.start as number
          return `@media (min-width:${start}px)`
        },
      },
      desktop: {
        start: 1050,
      },
    },
  }),
  mixins: ({ atoms }) => ({
    surface: {
      padding: 10,
      backgroundColor: atoms.colors.surface.main,
      color: atoms.colors.surface.text,
    },
  }),
})
