import Layout from "@/components/layout"
import theme from "@/theme"
import { ChakraProvider } from "@chakra-ui/react"
import { Base, BaseGoerli, Localhost } from "@thirdweb-dev/chains"
import {
  coinbaseWallet,
  magicLink,
  metamaskWallet,
  smartWallet,
  ThirdwebProvider,
  walletConnect,
} from "@thirdweb-dev/react"
import { AppProps } from "next/app"
import Fonts from "../theme/Fonts"

const App = ({ Component, pageProps }: AppProps) => {
  const magicLinkConfig = magicLink({
    emailLogin: true,
    smsLogin: true,
    apiKey: process.env.NEXT_PUBLIC_MAGICLINK_API_KEY,
    oauthOptions: {
      providers: ["twitter", "google", "apple"],
    },
  })

  let wallets = []
  if (process.env.NEXT_PUBLIC_SMART_ACCOUNTS == "true") {
    wallets = [
      smartWallet(magicLinkConfig, {
        factoryAddress: process.env.NEXT_PUBLIC_ACCOUNT_FACTORY_ADDRESS,
        gasless: false,
      }),
      smartWallet(metamaskWallet(), {
        factoryAddress: process.env.NEXT_PUBLIC_ACCOUNT_FACTORY_ADDRESS,
        gasless: false,
      }),
      smartWallet(coinbaseWallet(), {
        factoryAddress: process.env.NEXT_PUBLIC_ACCOUNT_FACTORY_ADDRESS,
        gasless: false,
      }),
      smartWallet(walletConnect(), {
        factoryAddress: process.env.NEXT_PUBLIC_ACCOUNT_FACTORY_ADDRESS,
        gasless: false,
      }),
    ]
  } else {
    wallets = [
      magicLinkConfig,
      metamaskWallet(),
      coinbaseWallet(),
      walletConnect(),
    ]
  }

  return (
    <ChakraProvider theme={theme}>
      <ThirdwebProvider
        supportedWallets={wallets}
        clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        supportedChains={[Base, BaseGoerli, Localhost]}
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
      </ThirdwebProvider>
    </ChakraProvider>
  )
}

export default App
