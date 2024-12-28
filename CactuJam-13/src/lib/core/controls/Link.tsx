import NextLink from "next/link"
import cn from "../functions/createClassName"
import "./controls.css"

export type LinkProps = {
  children?: React.ReactNode
  body?: React.ReactNode
  href?: string
  download?: boolean | string
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
  ariaCurrent?: `page` | `step` | `location` | `date` | `time` | boolean
  disabled?: boolean
  target?: `_blank` | `_self` | `_parent` | `_top`
  rel?: string
  onClick?: () => void
  formAction?: () => void
  buttonType?: `submit` | `button`
  locale?: false | string
}

export default function Link({ children, disabled, body, style, ariaLabel, ariaCurrent, rel, className, href, download, target, onClick, formAction, buttonType, locale }:LinkProps) {
  children ||= body

  const commonProps = { className, children }
  const nonButtonClassName = cn( `as-a`, className )

  if (disabled) return <span {...commonProps} className={nonButtonClassName} aria-disabled="true" />
  if (onClick || formAction) return <button type={buttonType} {...commonProps} className={nonButtonClassName} onClick={onClick} formAction={formAction} />
  if (!href) return <span {...commonProps} className={nonButtonClassName} />

  const justLinksProps = {
    ...commonProps,
    "aria-label": ariaLabel,
    "aria-current": ariaCurrent || undefined,
    download,
    rel,
    target,
    href,
    style,
  }

  if (download || /^https?:\/\/|^\w+:/.test( href )) return <a {...justLinksProps} />
  return <NextLink {...justLinksProps} locale={locale} />
}
