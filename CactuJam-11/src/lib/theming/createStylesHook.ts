import { createUseStyles, useTheme } from "react-jss"
import { StylesCreator, Theme, ThemeWithActions, ThemeWithActionsFrom, UserDefinedStyles } from "./types"

export type UseStyles<Classes extends UserDefinedStyles, Them extends null | ThemeWithActions<any, any, any, any>> = () => [
  { [K in keyof Classes]:string },
  Them
]

export default function createStylesHook<
  Classes extends UserDefinedStyles,
  Them extends null | Theme<any, any, any, any>,
>( stylesCreator:Classes | StylesCreator<Them, Classes> ): UseStyles<Classes, ThemeWithActionsFrom<Them>> {
  const useStyles = createUseStyles( stylesCreator )

  return () => {
    const theme = useTheme<ThemeWithActionsFrom<Them>>()

    if (!theme) throw new Error( `You are trying to use theming functionality outside theming context` )

    const classes = useStyles() as { [K in keyof Classes]:string }

    return [ classes, theme ]
  }
}
