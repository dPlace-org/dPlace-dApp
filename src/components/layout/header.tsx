import {
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  useDisclosure,
} from "@chakra-ui/react"
import {
  ConnectWallet,
  lightTheme,
  useContract,
  useSigner,
} from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { FaQuestion } from "react-icons/fa"
import { DPlaceGrid__factory } from "types"
import { FAQ } from "./FAQ"

const Header = () => {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS

  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  const signer = useSigner()

  let withdraw = async () => {
    setLoading(true)
    try {
      await contract.call("withdraw")
      setLoading(false)
      setWithdrawAmount("0.0")
    } catch (e) {
      setLoading(false)
    }
  }

  const {
    isOpen: isFaqOpen,
    onOpen: onFaqOpen,
    onClose: onFaqClose,
  } = useDisclosure()

  let [withdrawAmount, setWithdrawAmount] = useState("")
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    let handler = async () => {
      let address = await signer.getAddress()
      setWithdrawAmount(
        ethers.utils
          .formatEther(await contract.call("deposits", [address]))
          .slice(0, 8),
      )
    }
    if (signer && contract) handler()
  }, [signer, contract])

  return (
    <HStack
      bgColor="#FF4500 !important"
      as="header"
      position="fixed"
      top="0"
      p={"1em"}
      zIndex="tooltip"
      justify="space-between"
      align="center"
      w="100%"
      maxW="100vw"
    >
      <HStack>
        <Image src="/assets/images/icon.svg" alt="icon" w="3.5em" />
        <Image src="/assets/images/logo.svg" alt="icon" w="12em" />
      </HStack>
      <ConnectWallet
        btnTitle={"Login"}
        modalTitleIconUrl="/assets/images/icon.svg"
        modalTitle={"Login with:"}
        theme={lightTheme({
          colors: {
            primaryButtonBg: "#ffffff",
            primaryButtonText: "#000000",
          },
        })}
        welcomeScreen={{
          img: {
            src: "/assets/images/icon.svg",
            width: 150,
            height: 150,
          },
          title: "Login to dPlace",
          subtitle: "Choose a login method to get started",
        }}
      />
      {withdrawAmount && withdrawAmount !== "0.0" && (
        <Button
          isLoading={loading}
          bgColor={"#FF4500"}
          color={"white"}
          pos={"absolute"}
          right="1em"
          top="98px"
          fontFamily={"minecraft"}
          onClick={withdraw}
          minW="11em"
        >
          Withdraw Ξ{withdrawAmount}
        </Button>
      )}
      <IconButton
        aria-label="FAQ"
        bgColor={"#FF4500"}
        color={"white"}
        pos={"absolute"}
        left="1em"
        top="98px"
        onClick={() => (isFaqOpen ? onFaqClose() : onFaqOpen())}
        borderRadius="4em"
        icon={<Icon as={FaQuestion} />}
      />
      <FAQ isOpen={isFaqOpen} onClose={onFaqClose} />
    </HStack>
  )
}

export default Header
