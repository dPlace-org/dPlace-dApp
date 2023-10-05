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
import { AppProps } from "next/app"
import Fonts from "../theme/Fonts"

const App = ({ Component, pageProps }: AppProps) => {
  const magicLinkConfig = magicLink({
    emailLogin: true,
    smsLogin: true,
    apiKey: "pk_live_10C3E4F0BA3D9751",
    oauthOptions: {
      providers: ["twitter", "google", "apple"],
    },
  })

  return (
    <ChakraProvider theme={theme}>
      <ThirdwebProvider
        supportedWallets={[
          magicLinkConfig,
          metamaskWallet(),
          coinbaseWallet(),
          walletConnect(),
        ]}
        clientId="28678e20e8bd088ede38dafe03cfc808"
        supportedChains={[Base, BaseGoerli, Localhost]}
        activeChain={
          process.env.NEXT_PUBLIC_TESTNET
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
      </ThirdwebProvider>
    </ChakraProvider>
  )
}

export default App
