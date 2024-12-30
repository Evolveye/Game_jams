import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: `export`,
  basePath: `/Game_jams/CactuJam-13/out`,
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
}

export default nextConfig
