import { SheetsRegistry, JssProvider, createGenerateId } from "react-jss"
import React, { ReactElement } from "react"
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document"

class MyDocument extends Document {
  static async getInitialProps({ renderPage }:DocumentContext) {
    const sheets = new SheetsRegistry()
    const generateId = createGenerateId()

    const decoratePage = (Page:React.ElementType) => function EnhancedPage( props:Record<string, unknown> ) {
      return (
        <JssProvider registry={sheets} generateId={generateId}>
          <Page {...props} />
        </JssProvider>
      )
    }

    const renderedPage = await renderPage( decoratePage )
    const styles:ReactElement<unknown, string>[] = [
      <style key='jss-ssr' type='text/css' data-jss-ssr='' dangerouslySetInnerHTML={{ __html:sheets.toString() }} />,
      //
    ]

    return { ...renderedPage, styles }
  }

  render() {
    return (
      <Html>
        <Head />

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
