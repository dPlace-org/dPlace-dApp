/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/subgraph",
        destination: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}`,
      },
    ]
  },
}

module.exports = nextConfig
