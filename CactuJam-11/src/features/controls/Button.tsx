import { ReactNode } from "react"
import { Link as GatsbyLink } from "gatsby"
import { CSSProperties } from "@lib/theming/types"
import cn from "@lib/theming/createClassName"
import select from "@lib/core/functions/select"
import { createStylesHook } from "@fet/theming"

export type ButtonProps = {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  body?: ReactNode
  linkRel?: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  variant?: `contained` | `outlined` | `clean`
  type?: `submit` | `button`
  ariaLabel?: string
}

export default function Button({ children, body, className, style, type, disabled, linkRel, onClick, href, ariaLabel, variant = `contained` }:ButtonProps) {
  children ||= body

  const [ classes ] = useStyles()
  const variantClassname = select( variant, {
    contained: classes.isContained,
    outlined: classes.isOutlined,
    clean: classes.isClean,
  } )

  const composedClassName = cn( classes.button, variantClassname, disabled && classes.isDisabled, className )

  if (onClick || type) {
    return <button aria-label={ariaLabel} className={composedClassName} style={style} type={type} onClick={onClick}>{children}</button>
  }

  if (href) {
    return <GatsbyLink to={href}><a className={composedClassName} style={style} rel={linkRel}>{children}</a></GatsbyLink>
  }

  return <div className={composedClassName}>{children}</div>
}

const useStyles = createStylesHook( ({ atoms }) => ({
  button: {
    display: `block`,
    width: `max-content`,
    height: `max-content`,
    padding: `0.5em 1em`,
    borderWidth: atoms.sizes.borderWidth + `px`,
    borderStyle: `solid`,
    backgroundColor: `transparent`,
    cursor: `pointer`,
    textDecoration: `none`,
    textAlign: `center`,
    color: `inherit`,
    font: `inherit`,
    lineHeight: `inherit`,
  },

  isContained: {
    borderColor: `transparent`,
    backgroundSize: `200% auto`,
    backgroundImage: `
      linear-gradient(
        45deg,
        rgb(255,143,77) 0%,
        rgb(255,184,65) 51%,
        rgb(255,143,77) 100%
      )`,
    // color: atoms.colors.primary.text,
    textShadow: `0 0 20px black`,
    // transition: atoms.transitions.text + `s`,
    transitionProperty: `color, background-position`,

    '&:hover': {
      backgroundPosition: `right center`,
    },

    '&:active': {
      backgroundImage: `
        linear-gradient(
          45deg,
          rgb(255,184,65) 0%,
          rgb(255,143,77) 51%,
          rgb(255,143,77) 100%
        )`,
    },
  },

  isOutlined: {
    // borderColor: atoms.colors.primary.main,
    color: atoms.colors.background.text,
    // transition: atoms.transitions.text + `s`,
    transitionProperty: `color, background-image`,

    "&:hover": {
      // color: atoms.colors.primary.main,
    },
  },

  isClean: {
    padding: 0,
    border: `unset`,
    borderRadius: 0,
    color: `inherit`,
    textAlign: `inherit`,
  },

  isDisabled: {
    opacity: 0.5,
    cursor: `not-allowed`,
  },
}) )
