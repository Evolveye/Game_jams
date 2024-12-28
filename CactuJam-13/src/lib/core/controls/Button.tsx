import { forwardRef } from "react"
import Link from "next/link"
import cn from "../functions/createClassName"
import { getGap } from "../flow/utils"
import ButtonInteractions from "./ButtonInteractions"
import classes from "./Button.module.css"

export type ButtonProps = {
  className?: string | { override:undefined | string }
  style?: React.CSSProperties
  children?: React.ReactNode
  body?: React.ReactNode
  linkRel?: string
  for?: string
  onClick?: null | ((e?:React.MouseEvent<HTMLButtonElement | HTMLLabelElement, globalThis.MouseEvent>) => void)
  formAction?: () => void
  onKey?: string
  href?: null | string
  target?: `_blank` | `_self` | `_parent` | `_top`
  download?: boolean
  disabled?: boolean
  wide?: boolean
  width?: number | string
  type?: `submit` | `button`
  ariaLabel?: string
  gap?: string | boolean | number
  ariaCurrent?: `page` | `step` | `location` | `date` | `time` | boolean
}

export default forwardRef<HTMLLabelElement | HTMLButtonElement | HTMLDivElement | HTMLAnchorElement, ButtonProps>( function Button( props, ref ) {
  const children = props.children || props.body

  const jsxAriaProps = {
    ariaDisabled: props.disabled ? true : undefined,
    ariaCurrent: props.ariaCurrent,
    ariaLabel: props.ariaLabel,
  }

  const commonProps = {
    children,
    className: typeof props.className === `object` ? props.className.override : cn( classes.button, props.className ),
    style: props.style,
  }

  if (props.wide || props.width) {
    commonProps.style ||= {}
    commonProps.style.width = props.wide ? `100%` : props.width
  }

  if (props.gap) {
    commonProps.style ||= {}
    commonProps.style.gap = getGap( props.gap )
  }

  if (props.for) {
    return <label ref={ref as React.LegacyRef<HTMLLabelElement>} {...commonProps} htmlFor={props.for} onClick={props.onClick || undefined} aria-label={jsxAriaProps.ariaLabel} aria-disabled={jsxAriaProps.ariaDisabled} />
  }

  if (props.formAction) {
    return <button ref={ref as React.LegacyRef<HTMLButtonElement>} type={props.type} {...commonProps} formAction={props.formAction} />
  }

  if (!props.href && (props.formAction || props.onClick || props.type)) {
    return <ButtonInteractions ref={ref as React.LegacyRef<HTMLButtonElement>} type={props.type} {...commonProps} {...jsxAriaProps} onKey={props.onKey} disabled={props.disabled} onClick={props.onClick || undefined} />
  }

  if (!props.href || props.disabled) {
    return <div ref={ref as React.LegacyRef<HTMLDivElement>} {...commonProps} aria-label={jsxAriaProps.ariaLabel} aria-disabled={jsxAriaProps.ariaDisabled} />
  }

  if (props.download || /^https?:\/\/|^\w+:/.test( props.href )) return <a {...commonProps} rel={props.linkRel} href={props.href} download={props.download} />
  return <Link ref={ref as React.LegacyRef<HTMLAnchorElement>} {...commonProps} aria-disabled={jsxAriaProps.ariaDisabled} rel={props.linkRel} target={props.target} href={props.href} download={props.download} />
} )
