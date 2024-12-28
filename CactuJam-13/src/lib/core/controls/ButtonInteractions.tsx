"use client"

import { forwardRef, useEffect } from "react"

export type ButtonProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  onClick?: null | ((e?:React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void)
  onKey?: string
  disabled?: boolean
  type?: `submit` | `button`
  ariaLabel?: string
  ariaCurrent?: `page` | `step` | `location` | `date` | `time` | boolean
}

export default forwardRef<HTMLButtonElement, ButtonProps>( function ButtonInteractions( props:ButtonProps, ref ) {
  useEffect( () => {
    if (!props.onKey) return

    const handler = (e:KeyboardEvent) => {
      if (props.onKey !== e.key) return

      e.preventDefault()
      e.stopPropagation()
      props.onClick?.()
    }

    window.addEventListener( `keydown`, handler )
    return () => window.removeEventListener( `keydown`, handler )
  }, [ props.onKey, props.onClick ] ) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      ref={ref}
      type={props.type}
      children={props.children}
      className={props.className}
      style={props.style}
      disabled={props.disabled}
      onClick={props.onClick || undefined}
      aria-disabled={props.disabled ? true : undefined}
      aria-current={props.ariaCurrent}
      aria-label={props.ariaLabel}
    />
  )
} )
