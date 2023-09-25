import { CSSProperties } from "@lib/theming"
import { Theme, createStylesHook } from "@fet/theming"

const getPseudoElementsBorderProps = (atoms:Theme["atoms"], props:CSSProperties) => ({
  "&::before": {
    content: `""`,
    display: `block`,
    position: `absolute`,
    inset: 0,
    borderWidth: 0,
    borderStyle: `solid`,
    borderColor: atoms.colors.positive + `aa`,
    ...props,
  },

  "&::after": {
    content: `""`,
    display: `block`,
    position: `absolute`,
    inset: 0,
    borderWidth: 0,
    borderStyle: `solid`,
    borderColor: atoms.colors.negative + `aa`,
    ...props,
  },
})

const useStyles = createStylesHook( ({ atoms }) => ({
  "@keyframes shift-before": {
    "0%": { transform:`translate( 0, 0 )` },
    "5%": { transform:`translate( 2px, 2px )` },
    "10%": { transform:`translate( 0, 0 )` },
    "100%": { transform:`translate( 0, 0 )` },
  },
  "@keyframes shift-after": {
    "0%": { transform:`translate( 0, 0 )` },
    "5%": { transform:`translate( -2px, -2px )` },
    "10%": { transform:`translate( 0, 0 )` },
    "100%": { transform:`translate( 0, 0 )` },
  },

  gameStartScreen: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
    justifyContent: `center`,
    color: atoms.colors.positive,
    height: `100dvh`,
  },
  colorsSetters: {
    margin: `0 auto`,
    width: `max-content`,
  },
  colorSetter: {
    display: `flex`,
    gap: atoms.spacing.main,
    marginBlock: atoms.spacing.main,
  },
  colorBox: {
    width: 50,
    height: 25,

    "body &::before": {
      inset: -5,
      animation: `10s infinite ease-in-out`,
      animationDelay: `2s`,
      animationName: `$shift-before`,
    },
    "body &::after": {
      inset: -5,
      animation: `10s infinite ease-in-out`,
      animationDelay: `2s`,
      animationName: `$shift-after`,
    },
  },

  gameUi: {
    display: `grid`,
    gridTemplateColumns: `200px 1fr 200px`,
    width: `100%`,
    height: `100dvh`,
  },
  column: {
    padding: atoms.spacing.small,

    "&.is-positive": {
      color: atoms.colors.positive,
    },

    "&.is-negative": {
      color: atoms.colors.positive,
    },
  },

  canvasesWrapper: {
    position: `relative`,

    ...getPseudoElementsBorderProps( atoms, {
      borderLeftWidth: atoms.sizes.border.width,
      borderRightWidth: atoms.sizes.border.width,
    } ),
  },
  canvas: {
    position: `absolute`,
    left: atoms.sizes.border.width,
    top: 0,
    width: `calc( 100% - ${atoms.sizes.border.width * 2}px )`,
    height: `100%`,
  },

  avatar: {
    width: `100%`,
    aspectRatio: 1,
  },

  frame: {
    position: `relative`,

    ...getPseudoElementsBorderProps( atoms, {
      borderWidth: atoms.sizes.border.width,
    } ),
  },

  stats: {
    padding: 0,

    "dl&": {
      display: `grid`,
      gridTemplateColumns: `1fr 1fr`,
      alignItems: `center`,
      gap: atoms.spacing.main,
    },

    "& > dt": {
      textAlign: `right`,
    },

    "& > dd": {
      textAlign: `left`,
      margin: 0,
    },

    "& > li": {
      textAlign: `left`,
      listStyle: `none`,
      margin: atoms.spacing.main,
    },
  },
}) )

export default useStyles
