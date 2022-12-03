import { createUseStyles, useTheme } from "react-jss"
import { CSSProperties, Theme } from "./types"

export type GlobalsStyles = {
  "*"?: CSSProperties
  body?: CSSProperties
}

export type BaseStylesProps<T extends null | Theme<any, any, any, any>> = {
  globals?: ((theme:T) => GlobalsStyles) | GlobalsStyles
}

export default function BaseStyles({ globals:globalsOrFn }:BaseStylesProps<any>) {
  const theme = useTheme() as null | Theme<any, any, any, any>
  const globals = globalsOrFn instanceof Function ? globalsOrFn( theme ) : globalsOrFn

  useStyles({ theme:globals })

  return null
}

const useStyles = createUseStyles( globals => ({
  "@global": {
    ...globals,
    "*": {
      boxSizing: `border-box`,
      ...globals[ `*` ],
    },
    body: {
      margin: 0,
      ...globals[ `body` ],
    },
  },
}) )
