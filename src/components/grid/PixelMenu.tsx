import { useCalculatePriceUSD } from "@/utils/Price"
import { getTextForColor } from "@/utils/utils"
import {
  Heading,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react"
import { useContract, useSigner, Web3Button } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { useMemo, useState } from "react"
import { FaQuestionCircle, FaTimes } from "react-icons/fa"
import { DPlaceGrid__factory } from "types"
import { useDebouncedCallback } from "use-debounce"
import { Pixel } from "./Grid"

interface ManagePixelsProps {
  maxPixels: number
  updatedPixels: Pixel[]
  removePixel: (x: number, y: number) => void
  confirmClaimPixels: () => void
  setLoading: (value: boolean) => void
}

export default function PixelMenu(props: ManagePixelsProps) {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const {
    maxPixels,
    updatedPixels,
    removePixel,
    confirmClaimPixels,
    setLoading,
  } = props
  const [priceBigNumber, setPriceBigNumber] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  )
  const [price, setPrice] = useState("0.0")
  const [priceLoading, setPriceLoading] = useState(false)
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  const signer = useSigner()
  const { usdPrice } = useCalculatePriceUSD({ ethAmount: price })

  const toast = useToast()

  let xs = updatedPixels.map((pixel) => pixel.x)
  let ys = updatedPixels.map((pixel) => pixel.y)

  let getPrice = useDebouncedCallback(async (xs: number[], ys: number[]) => {
    setPriceLoading(true)
    try {
      let _price = await contract.call("calculatePixelsPrice", [xs, ys])
      setPrice(ethers.utils.formatEther(_price))
      setPriceBigNumber(_price)
    } catch (e) {
      console.log(e)
    }
    setPriceLoading(false)
  }, 100)

  useMemo(() => {
    let handler = async () => {
      if (xs.length === 0 && ys.length === 0) {
        setPrice("0.0")
        return
      }
      await getPrice(xs, ys)
    }
    handler()
  }, [updatedPixels])

  return (
    <Stack bgColor="white" boxShadow="inset 0px 5px 5px rgb(0 0 0 / 28%)">
      <Stack m="1em">
        <Heading
          mt="10px"
          fontSize={"1.5em"}
          fontFamily="minecraft"
          letterSpacing={"1px"}
        >
          Updated Pixels ({updatedPixels.length})
        </Heading>
        <HStack mt="-10px">
          <Tooltip
            label="The more pixels you try to claim the higher the chance your transaction will fail."
            placement="right"
          >
            <HStack>
              <Text
                fontFamily={"minecraft"}
                w="fit-content"
                color="gray"
                mt="0"
              >
                <span style={{ fontWeight: "bold" }}>Max:</span> {maxPixels}
              </Text>
              <Icon mt="-5px" as={FaQuestionCircle} color="gray" />
            </HStack>
          </Tooltip>
        </HStack>
        <HStack
          whiteSpace={"nowrap"}
          overflow={"auto"}
          pt="1.5em"
          mt="-.5em"
          minH="105px"
        >
          {updatedPixels.length == 0 ? (
            <>
              <Stack
                h="5em"
                w="5em"
                bgColor={"lightGray"}
                justifyContent="center"
              >
                <Stack gap="0" alignItems={"center"} justifyContent={"center"}>
                  <Text fontFamily={"minecraft"}>Use</Text>
                </Stack>
              </Stack>
              <Stack
                h="5em"
                w="5em"
                bgColor={"lightGray"}
                opacity=".5"
                justifyContent="center"
              >
                <Stack gap="0" alignItems={"center"} justifyContent={"center"}>
                  <Text fontFamily={"minecraft"}>The</Text>
                </Stack>
              </Stack>
              <Stack
                h="5em"
                w="5em"
                bgColor={"lightGray"}
                opacity=".25"
                justifyContent="center"
              >
                <Stack gap="0" alignItems={"center"} justifyContent={"center"}>
                  <Text fontFamily={"minecraft"}>Brush</Text>
                </Stack>
              </Stack>
            </>
          ) : (
            updatedPixels.map((pixel, index) => (
              <Stack
                key={index}
                bgColor={pixel.color}
                color={getTextForColor(pixel.color)}
              >
                <Stack
                  h="5em"
                  w="5em"
                  gap="0"
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <IconButton
                    mt="-2.5em"
                    borderRadius={"1em"}
                    aria-label="remove"
                    size="sm"
                    onClick={() => removePixel(pixel.x, pixel.y)}
                    icon={<Icon as={FaTimes} />}
                    alignSelf="flex-end"
                    marginRight="-1em"
                  />
                  <Text fontFamily={"minecraft"}>{pixel.x}</Text>
                  <Text fontFamily={"minecraft"}>{pixel.y}</Text>
                </Stack>
              </Stack>
            ))
          )}
        </HStack>
        <Heading fontSize={"1.5em"}>
          <span style={{ fontFamily: "minecraft" }}>Total:</span>
          {priceLoading ? (
            <Spinner />
          ) : (
            <>
              <span style={{ fontWeight: "initial" }}> Ξ{price}</span>
              <span style={{ fontSize: "15px", color: "gray" }}>
                {" "}
                (${usdPrice})
              </span>
            </>
          )}
        </Heading>
        <Web3Button
          contractAddress={gridAddress}
          contractAbi={DPlaceGrid__factory.abi}
          isDisabled={updatedPixels.length === 0}
          style={{
            fontFamily: "minecraft",
            letterSpacing: "1px",
            fontSize: "18px",
            backgroundColor: updatedPixels.length === 0 ? "" : "#FF4500",
            color: updatedPixels.length === 0 ? "gray" : "white",
          }}
          action={async (_contract) => {
            if (!priceBigNumber) return
            let colors = updatedPixels.map((pixel) =>
              ethers.utils.formatBytes32String(pixel.color),
            )
            try {
              setLoading(true)
              let grid = DPlaceGrid__factory.connect(gridAddress, signer)
              let newestPrice = await grid.calculatePixelsPrice(xs, ys)
              let gasPrice = await grid.estimateGas.claimPixels(
                xs,
                ys,
                colors,
                {
                  value: newestPrice,
                },
              )
              await (
                await grid.claimPixels(xs, ys, colors, {
                  value: newestPrice,
                  gasPrice: gasPrice,
                })
              ).wait()
              setLoading(false)
            } catch (e: any) {
              console.log(e)
              setLoading(false)
              toast({
                title: `Transaction Error!`,
                description:
                  "Something went wrong. make sure you have enough funds and try again!",
                status: "error",
                isClosable: true,
              })
              return
            }
            confirmClaimPixels()
          }}
        >
          Claim Pixels
        </Web3Button>
      </Stack>
    </Stack>
  )
}
