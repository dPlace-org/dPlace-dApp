/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/subgraph/:path*",
        destination: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
