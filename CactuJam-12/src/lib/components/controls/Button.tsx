import { ReactNode } from "react"
import { cn, createStylesHook, CSSProperties } from "../../theming"
import select from "../../core/functions/select"
import Link from "./Link"

export type ButtonVariant = `contained` | `outlined` | `text` | `clean`
export type ButtonProps = {
  className?: string
  style?: CSSProperties
  children?: ReactNode
  body?: ReactNode
  linkRel?: string
  onClick?: () => void
  href?: string
  for?: string
  disabled?: boolean
  wide?: boolean
  variant?: ButtonVariant
  type?: `submit` | `button`
  ariaLabel?: string
  ariaCurrent?: `page` | `step` | `location` | `date` | `time` | boolean
}

export default function Button({ children, body, className, style, type, disabled, linkRel, onClick, for:htmlFor, href, wide, ariaLabel, ariaCurrent, variant = `contained` }:ButtonProps) {
  children ||= body

  const [ classes ] = useStyles()
  const variantClassname = select( variant, {
    contained: classes.isContained,
    outlined: classes.isOutlined,
    text: classes.isText,
    clean: classes.isClean,
  } )

  const composedClassName = cn(
    classes.button,
    wide && classes.isWide,
    variantClassname,
    className,
  )

  const commonProps = {
    children,
    className: composedClassName,
    style,
    "aria-disabled": disabled ? true : undefined,
    "aria-current": ariaCurrent,
  }

  if (htmlFor) {
    return <label {...commonProps} htmlFor={htmlFor} />
  }

  if (onClick || type) {
    return <button {...commonProps} disabled={disabled} aria-label={ariaLabel} type={type} onClick={onClick} />
  }

  if (href && !disabled) {
    return <Link {...commonProps} rel={linkRel} href={href} />
  }

  return <div {...commonProps} />
}

const useStyles = createStylesHook( ({ components }) => ({
  button: {
    display: `flex`,
    justifyContent: `center`,
    alignItems: `center`,
    width: `max-content`,
    height: `45px`,
    padding: `0 35px`,
    backgroundColor: `transparent`,
    cursor: `pointer`,
    textDecoration: `none`,
    textAlign: `center`,
    color: `inherit`,
    font: `inherit`,
    lineHeight: `inherit`,
    borderWidth: 0,
    borderColor: `transparent`,

    ...components.Button,

    "&[aria-disabled]": {
      ...components.Button_Disabled,
    },
  },

  isContained: {
    ...components.Button_Contained,
  },

  isOutlined: {
    ...components.Button_Outlined,
  },

  isText: {
    ...components.Button_Text,
  },

  isClean: {
    display: `block`,
    padding: 0,
    border: `unset`,
    borderRadius: 0,
    color: `inherit`,
    textAlign: `inherit`,
  },

  isWide: {
    width: `unset`,
  },
}), `lib::Button` )
