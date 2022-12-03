import path from "path"
import dotenv from "dotenv"
import type { GatsbyConfig } from "gatsby"

dotenv.config()

const config:GatsbyConfig = {
  siteMetadata: {
    title: `CodeCactu website`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    {
      resolve: `gatsby-plugin-alias-imports`,
      options: {
        alias: {
          "@img": path.resolve( __dirname, `src/images` ),
          "@fet": path.resolve( __dirname, `src/features` ),
          "@lib": path.resolve( __dirname, `src/lib` ),
        },
        extensions: [],
      },
    },
  ],
}

export default config
