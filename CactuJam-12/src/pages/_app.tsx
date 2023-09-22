import ThemeProvider from '@lib/theming/ThemeProvider'
import { themeConfig } from '@fet/theming'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }:AppProps) {
  return (
    <ThemeProvider themeConfig={themeConfig}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
