/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  headers: [
    {
      source:
        "https://thegraph.com/hosted-service/subgraph/dplace-org/dplace-testnet/*",
      headers: [
        { key: "Access-Control-Allow-Credentials", value: "true" },
        { key: "Access-Control-Allow-Origin", value: "*" },
        {
          key: "Access-Control-Allow-Methods",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "*",
        },
      ],
    },
  ],
  headers: [
    { key: "Access-Control-Allow-Credentials", value: "true" },
    { key: "Access-Control-Allow-Origin", value: "*" },
    {
      key: "Access-Control-Allow-Methods",
      value: "*",
    },
    {
      key: "Access-Control-Allow-Headers",
      value: "*",
    },
  ],
}

module.exports = nextConfig
