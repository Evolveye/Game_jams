import ThemeProvider from "@lib/theming/ThemeProvider"
import { themeConfig } from "@fet/theming"
import GameSection from "../sections/gameSection"

export default function IndexPage() {
  return (
    <ThemeProvider themeConfig={themeConfig}>
      <GameSection />
    </ThemeProvider>
  )
}
