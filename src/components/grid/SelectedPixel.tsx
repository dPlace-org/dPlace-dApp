import { useGetPixel } from "@/utils/Subgraph"
import { trimAddress } from "@/utils/utils"
import {
  Center,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { useSigner } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Countdown from "react-countdown"
import { DPlaceGrid__factory } from "types"
import { useCalculatePriceUSD } from "../../utils/Price"
import { getTextForColor } from "../../utils/utils"
import Identicon from "../identicon"
import { Pixel } from "./Grid"

export default function SelectedPixel({
  pixel,
  setUpdateColor,
}: {
  pixel: Pixel | null
  setUpdateColor: (val: string) => void
}) {
  const gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const [price, setPrice] = useState<string>("0.0")
  const [owner, setOwner] = useState<string>("--")
  const [color, setColor] = useState<string>("")
  const [_loading, setLoading] = useState<boolean>(false)
  const [halvingTime, setHalvingTime] = useState<number>(0)
  const { getPixel, initialized, loading: pixelLoading } = useGetPixel()
  const { usdPrice } = useCalculatePriceUSD({ ethAmount: price })
  const signer = useSigner()

  const loading = pixelLoading || _loading

  useEffect(() => {
    let handler = async () => {
      let _pixel = await getPixel(pixel.x, pixel.y)
      if (_pixel) {
        setLoading(true)
        let grid = DPlaceGrid__factory.connect(gridAddress, signer)
        let _price = await grid.calculatePixelPrice(pixel.x, pixel.y)
        setPrice(ethers.utils.formatEther(_price))
        setOwner(_pixel.owner)
        setColor(_pixel.color)
        setUpdateColor(_pixel.color)
        setHalvingTime(calculateNextHalving(_pixel))
        setLoading(false)
        return
      }
      setColor("")
      setOwner("--")
      setPrice("0.0")
      setHalvingTime(null)
    }
    if (pixel && initialized && signer) handler()
  }, [pixel, initialized, signer])

  const calculateNextHalving = (pixel: Pixel) => {
    let halvingsPassed =
      (Date.now() - Number(pixel.lastUpdated) * 1000) / 1000 / 60 / 60 / 4
    let wholeHalvingsPassed = Math.floor(halvingsPassed)
    let nextHalvingIn =
      (1 - (halvingsPassed - wholeHalvingsPassed)) * 4 * 60 * 60 * 1000
    return Date.now() + nextHalvingIn
  }

  return (
    <Stack
      mt="1em"
      placeContent={"center"}
      bgColor="white"
      boxShadow="0 10px 10px rgb(0 0 0 / 0.2)"
    >
      {loading ? (
        <Center h="100%" py="178.5px">
          <Spinner />
        </Center>
      ) : (
        <>
          <Stack m="1em">
            <Heading
              fontFamily={"minecraft"}
              fontWeight={"normal"}
              size="lg"
              textAlign={"center"}
            >
              {pixel ? "X" + pixel.x + " • " + "Y" + pixel.y : "Select a pixel"}
            </Heading>
            <Stack
              w="5em"
              h={"5em"}
              bgColor={color}
              border={!color ? "4px dashed black" : "none"}
              alignSelf={"center"}
              gap="0"
              alignItems={"center"}
              justifyContent={"center"}
              fontWeight={"bold"}
            >
              <Text color={color ? getTextForColor(color) : "black"}>
                {pixel?.x || "--"}
              </Text>
              <Text color={color ? getTextForColor(color) : "black"}>
                {pixel?.y || "--"}
              </Text>
            </Stack>
          </Stack>

          <Stack m="1em">
            <Heading size="md" fontFamily={"minecraft"}>
              Price: {!color ? "UNCLAIMED" : ""}
            </Heading>
            {color && (
              <HStack justifyContent={"space-between"} alignItems={"flex-end"}>
                <Stack maxW="136px">
                  <Tooltip label={"Ξ" + price} placement="right">
                    <Heading
                      overflow="hidden"
                      textOverflow={"ellipsis"}
                      size="lg"
                      color="#FF4500"
                      whiteSpace={"nowrap"}
                    >
                      Ξ{price}
                    </Heading>
                  </Tooltip>
                  <Text
                    fontWeight={"bold"}
                    fontSize="sm"
                    mt="-8px"
                    color="gray"
                  >
                    ${usdPrice}
                  </Text>
                </Stack>
                <Stack alignItems={"flex-end"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize="sm"
                    mt="-8px"
                    color="gray"
                    fontFamily={"minecraft"}
                  >
                    HALVING
                  </Text>
                  {halvingTime && (
                    <Countdown
                      onComplete={() => setHalvingTime(halvingTime + 14400000)} // reset clock
                      date={halvingTime}
                    />
                  )}
                </Stack>
              </HStack>
            )}
          </Stack>
          <Stack alignItems={"flex-end"} bgColor={"lightgray"} p="1em">
            <Heading fontFamily={"minecraft"} color="gray" size="md">
              Owner:
            </Heading>
            <HStack>
              <Identicon account={owner} />
              <Heading color="black" size="md" fontFamily={"minecraft"}>
                {trimAddress(owner, 4)}
              </Heading>
            </HStack>
          </Stack>
        </>
      )}
    </Stack>
  )
}
