import { HStack, Icon, IconButton, Text, useDisclosure } from "@chakra-ui/react"
import { ConnectButton } from "@mysten/dapp-kit"
import { FaQuestion } from "react-icons/fa"
import { FAQ } from "./FAQ"

const Header = () => {
  const {
    isOpen: isFaqOpen,
    onOpen: onFaqOpen,
    onClose: onFaqClose,
  } = useDisclosure()

  return (
    <HStack
      bgColor="#4ca3ff !important"
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
        <Text
          textAlign={"center"}
          color="white"
          fontFamily={"minecraft"}
          fontSize="4xl"
          pt="8px"
        >
          SuiPlace
        </Text>
        {/* <Image src="/assets/images/icon.svg" alt="icon" w="3.5em" />
        <Image src="/assets/images/logo.svg" alt="icon" w="12em" /> */}
      </HStack>
      <ConnectButton />;
      <IconButton
        aria-label="FAQ"
        bgColor={"#4ca3ff"}
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
