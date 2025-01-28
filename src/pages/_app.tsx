import Layout from "@/components/layout"
import theme from "@/theme"
import { ChakraProvider } from "@chakra-ui/react"
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit"
import "@mysten/dapp-kit/dist/index.css"
import { getFullnodeUrl } from "@mysten/sui/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Analytics } from "@vercel/analytics/react"
import { AppProps } from "next/app"
import Fonts from "../theme/Fonts"
import "./styles.css"

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
})
const queryClient = new QueryClient()

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect>
            <Fonts />
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Analytics />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
