import { useCalculatePriceUSD } from "@/utils/Price"
import {
  Button,
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
import { FaTimes } from "react-icons/fa"
import { DPlaceGrid__factory } from "types"
import { useDebouncedCallback } from "use-debounce"
import { Pixel } from "./Grid"

interface ManagePixelsProps {
  maxSpaces: number
  updatedPixels: Pixel[]
  removePixel: (x: number, y: number) => void
  confirmClaimPixels: () => void
  clearUpdatedPixels: () => void
}

export default function ManagePixels(props: ManagePixelsProps) {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const {
    maxSpaces,
    updatedPixels,
    removePixel,
    confirmClaimPixels,
    clearUpdatedPixels,
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
        {/* <Heading mt="1em" fontSize={"1.5em"}>
          Your Pixels
        </Heading> */}

        <Heading
          mt="10px"
          fontSize={"1.5em"}
          fontFamily="minecraft"
          letterSpacing={"1px"}
        >
          Updated Pixels ({updatedPixels.length})
        </Heading>
        <HStack>
          <Tooltip
            label="This is to reduce the chances of transaction failure"
            placement="right"
          >
            <Text w="fit-content" color="gray" mt="0">
              <span style={{ fontWeight: "bold" }}>Max:</span> {maxSpaces}
            </Text>
          </Tooltip>
          {updatedPixels.length > 0 && (
            <Button size="sm" onClick={clearUpdatedPixels}>
              Clear
            </Button>
          )}
        </HStack>
        <HStack
          whiteSpace={"nowrap"}
          overflow={"auto"}
          pt="1.5em"
          mt="-.5em"
          minH="105px"
        >
          {updatedPixels.map((pixel, index) => (
            <Stack key={index} bgColor={pixel.color}>
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
                <Text>{pixel.x}</Text>
                <Text>{pixel.y}</Text>
              </Stack>
            </Stack>
          ))}
        </HStack>

        <Heading mt="1em" fontSize={"1.5em"}>
          Total:
          {priceLoading ? (
            <Spinner />
          ) : (
            <>
              <span style={{ fontWeight: "initial" }}>Ξ{price}</span>
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
            backgroundColor: "#FF4500",
            color: "#fff",
          }}
          action={async (_contract) => {
            if (!priceBigNumber) return
            let colors = updatedPixels.map((pixel) =>
              ethers.utils.formatBytes32String(pixel.color),
            )
            try {
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
            } catch (e: any) {
              console.log(e)
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
