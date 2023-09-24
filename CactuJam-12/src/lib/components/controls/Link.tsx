import { ReactNode } from "react"
import NextLink from "next/link"
import { cn, createStylesHook } from "../../theming"

export type LinkVariant = `regular` | `clean`
export type LinkProps = {
  children?: ReactNode
  body?: ReactNode
  href?: string
  className?: string
  ariaLabel?: string
  variant?: LinkVariant
  ariaCurrent?: `page` | `step` | `location` | `date` | `time` | boolean
  rel?: string
}

export default function Link({ children, body, variant, ariaLabel, ariaCurrent, rel, className, href }:LinkProps) {
  children ||= body

  const [ classes ] = useStyles()
  const commonProps = {
    className: cn( variant === `clean` ? classes.clearLink : classes.link, className ),
    "aria-label": ariaLabel,
    "aria-current": !ariaCurrent ? undefined : ariaCurrent,
    children,
  }

  if (!href) return <span {...commonProps} />
  if (/https?:\/\//.test( href )) return <a {...commonProps} rel={rel} href={href} />
  return <NextLink {...commonProps} rel={rel} href={href} />
}

const useStyles = createStylesHook( ({ components }) => ({
  link: {
    color: `inherit`,
    textDecoration: `none`,

    ...components.Link,
  },

  clearLink: {
    color: `inherit`,
    textDecoration: `none`,
  },
}), `lib::Link` )
