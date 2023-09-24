import { ReactNode } from "react"
import { ButtonVariant } from "@lib/components/controls/Button"
import { Button, Link } from "@lib/components/controls"

export type NavItemProps = {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  variant?: ButtonVariant
}

export default function NavItem({ children, className, href, onClick, variant }:NavItemProps) {
  const commonProps = { children, className }

  if (onClick) return (
    <li>
      <Button variant={variant} onClick={onClick} {...commonProps} />
    </li>
  )

  if (href) return (
    <li>
      <Link href={href} {...commonProps} />
    </li>
  )

  return <li {...commonProps} />
}
