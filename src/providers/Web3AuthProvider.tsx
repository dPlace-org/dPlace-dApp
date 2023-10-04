import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base"
import { MetamaskAdapter } from "@web3auth/metamask-adapter"
import { Web3Auth } from "@web3auth/modal"
import * as React from "react"
import { useEffect, useState } from "react"
import EthereumRpc from "../utils/EthersRPC"

export const Web3AuthContext = React.createContext<{
  web3Auth: Web3Auth
  provider: IProvider
  initialized: boolean
  login: () => void
  logout: () => void
  loggedIn: boolean
  address: string
}>(undefined)

export function Web3AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false)
  const [loggedIn, setIsLoggedIn] = useState(false)
  const [address, setAddress] = useState("")
  const [web3Auth, setWeb3Auth] = useState<Web3Auth>(undefined)
  const [provider, setProvider] = useState<IProvider>(undefined)

  const clientId =
    "BG8fls_TMfMjLbKY7udgjy-55ItQC-90sKeyyVGq5VTK6yzSX3J5NLOKrYFUvFH0C2IIHy0w2NzKuUiY7RjmEx4"

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          authMode: "DAPP",
          uiConfig: {
            appName: "dPlace",
            mode: "dark",
            loginMethodsOrder: ["twitter", "apple", "google", "reddit"],
            logoLight: "/assets/images/icon.svg",
            logoDark: "/assets/images/icon.svg",
            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
            loginGridCol: 2,
            primaryButton: "externalLogin",
          },
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x1",
            rpcTarget: "https://rpc.ankr.com/eth", // TODO: update RPC endpoint
          },
          web3AuthNetwork: "sapphire_devnet",
        })

        // adding metamask adapter
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 86400, // 1 day in seconds
          web3AuthNetwork: "sapphire_devnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x1",
            rpcTarget: "https://rpc.ankr.com/eth", // TODO: update RPC endpoint
          },
        })

        // TODO: Wallet connect is causing problems. figure it out and uncomment
        // const defaultWcSettings = await getWalletConnectV2Settings(
        //   "eip155",
        //   [1],
        //   "e0d96669288a4d9210fb9a445d7babdb",
        // )
        // const walletConnectV2Adapter = new WalletConnectV2Adapter({
        //   adapterSettings: { ...defaultWcSettings.adapterSettings },
        //   loginSettings: { ...defaultWcSettings.loginSettings },
        // })

        // web3auth.configureAdapter(walletConnectV2Adapter)

        // it will add/update  the metamask adapter in to web3auth class
        web3auth.configureAdapter(metamaskAdapter)

        setWeb3Auth(web3auth)
        setProvider(web3auth.provider)

        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
              label: "wallet_connect",
              showOnModal: false,
            },
            [WALLET_ADAPTERS.TORUS_EVM]: {
              label: "torus_evm",
              showOnModal: false,
            },
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "openlogin",
              loginMethods: {
                // Disable facebook and reddit
                facebook: {
                  name: "facebook",
                  showOnModal: false,
                },
                reddit: {
                  name: "reddit",
                  showOnModal: false,
                },
                github: {
                  name: "github",
                  showOnModal: false,
                },
                discord: {
                  name: "discord",
                  showOnModal: false,
                },
                kakao: {
                  name: "kakao",
                  showOnModal: false,
                },
                linkedin: {
                  name: "linkedin",
                  showOnModal: false,
                },
                weibo: {
                  name: "weibo",
                  showOnModal: false,
                },
                wechat: {
                  name: "wechat",
                  showOnModal: false,
                },
                line: {
                  name: "line",
                  showOnModal: false,
                },
                twitch: {
                  name: "twitch",
                  showOnModal: false,
                },
              },
            },
          },
        })
        setInitialized(true)
      } catch (error) {
        console.error(error)
        setInitialized(false)
      }
    }

    init()
  }, [])

  const login = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet")
      return
    }
    if (web3Auth.status == "connected") {
      await web3Auth.logout()
      setIsLoggedIn(false)
      return
    }
    const web3authProvider = await web3Auth.connect()
    const rpc = new EthereumRpc(web3authProvider)
    const address = await rpc.getAccounts()
    setProvider(web3authProvider)
    setAddress(address)
    setIsLoggedIn(true)
  }

  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet")
      return
    }
    await web3Auth.logout()
    setIsLoggedIn(false)
    setAddress("")
  }

  return (
    <Web3AuthContext.Provider
      value={{
        web3Auth,
        address,
        provider,
        login,
        logout,
        loggedIn,
        initialized,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  )
}
