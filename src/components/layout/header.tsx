import { HStack, Image } from "@chakra-ui/react"
import { ConnectWallet, lightTheme } from "@thirdweb-dev/react"

const Header = () => {
  return (
    <HStack
      bgColor="#FF4500"
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
          subtitle: "Choose a login method to  get started",
        }}
      />
    </HStack>
  )
}

export default Header
