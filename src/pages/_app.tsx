import Layout from "@/components/layout"
import theme from "@/theme"
import { ChakraProvider } from "@chakra-ui/react"
import { Base, BaseGoerli, Localhost } from "@thirdweb-dev/chains"
import {
  coinbaseWallet,
  magicLink,
  metamaskWallet,
  ThirdwebProvider,
  walletConnect,
} from "@thirdweb-dev/react"
import { Analytics } from "@vercel/analytics/react"
import { AppProps } from "next/app"
import Fonts from "../theme/Fonts"
import "./styles.css"

const App = ({ Component, pageProps }: AppProps) => {
  const magicLinkConfig = magicLink({
    emailLogin: true,
    smsLogin: true,
    apiKey: process.env.NEXT_PUBLIC_MAGICLINK_API_KEY,
    oauthOptions: {
      providers: ["twitter", "google"],
    },
  })

  let wallets = [
    magicLinkConfig,
    metamaskWallet(),
    coinbaseWallet(),
    walletConnect(),
  ]

  return (
    <ChakraProvider theme={theme}>
      <ThirdwebProvider
        supportedWallets={wallets}
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        supportedChains={[
          process.env.NEXT_PUBLIC_TESTNET == "true"
            ? BaseGoerli
            : process.env.NODE_ENV == "development"
            ? Localhost
            : Base,
        ]}
        autoConnect={true}
        sdkOptions={{
          readonlySettings: {
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
          },
        }}
        activeChain={
          process.env.NEXT_PUBLIC_TESTNET == "true"
            ? "base-goerli"
            : process.env.NODE_ENV == "development"
            ? "localhost"
            : "base"
        }
      >
        <Fonts />
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Analytics />
      </ThirdwebProvider>
    </ChakraProvider>
  )
}

export default App
