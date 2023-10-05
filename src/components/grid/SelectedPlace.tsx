import { useGetPlace } from "@/utils/Subgraph"
import { trimAddress } from "@/utils/utils"
import { Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Countdown from "react-countdown"
import Identicon from "../identicon"
import { Place } from "./Grid"

export default function SelectedPlace({
  place,
  setUpdateColor,
}: {
  place: Place | null
  setUpdateColor: (val: string) => void
}) {
  const [price, setPrice] = useState<string>("--")
  const [dollarPrice, setDollarPrice] = useState<string>("--")
  const [owner, setOwner] = useState<string>("--")
  const [color, setColor] = useState<string>("lightgray")
  const [halvingTime, setHalvingTime] = useState<number>(0)
  const { getPlace } = useGetPlace()

  useEffect(() => {
    let handler = async () => {
      let _place = await getPlace(place.x, place.y)
      if (_place) {
        setPrice(ethers.utils.formatEther(_place.price))
        setOwner(_place.owner)
        setColor(_place.color)
        setUpdateColor(_place.color)
        setHalvingTime(calculateNextHalving(_place))
        return
      }
      setColor("lightgray")
      setOwner("--")
      setPrice("--")
      setHalvingTime(null)
    }
    if (place) handler()
  }, [place])

  const calculateNextHalving = (place: Place) => {
    let halvingsPassed =
      (Date.now() - Number(place.lastUpdated) * 1000) / 1000 / 60 / 60 / 4
    let wholeHalvingsPassed = Math.floor(halvingsPassed)
    let nextHalvingIn =
      (halvingsPassed - wholeHalvingsPassed) * 4 * 60 * 60 * 1000
    return Date.now() + nextHalvingIn
  }

  return (
    <Stack
      minH="15em"
      placeContent={"center"}
      bgColor="white"
      boxShadow="0 10px 10px rgb(0 0 0 / 0.2)"
    >
      <Stack m="1em">
        <Heading
          fontFamily={"minecraft"}
          fontWeight={"normal"}
          size="lg"
          textAlign={"center"}
        >
          {place ? "X" + place.x + " • " + "Y" + place.y : "Select a place"}
        </Heading>
        <Stack
          w="5em"
          h={"5em"}
          bgColor={color}
          alignSelf={"center"}
          gap="0"
          alignItems={"center"}
          justifyContent={"center"}
          fontWeight={"bold"}
        >
          <Text color="white" opacity=".6">
            {place?.x || "--"}
          </Text>
          <Text color="white" opacity=".6">
            {place?.y || "--"}
          </Text>
        </Stack>
      </Stack>

      <Stack m="1em">
        <HStack justifyContent={"space-between"} alignItems={"flex-end"}>
          <Stack maxW="136px">
            <Heading size="md">Price:</Heading>
            <Heading
              size="lg"
              color="#FF4500"
              whiteSpace={"nowrap"}
              overflow="scroll"
            >
              Ξ{price}
            </Heading>
            <Text fontWeight={"bold"} fontSize="sm" mt="-8px" color="gray">
              ${dollarPrice}
            </Text>
          </Stack>
          <Stack alignItems={"flex-end"}>
            <Text fontWeight={"bold"} fontSize="sm" mt="-8px" color="gray">
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
      </Stack>
      <Stack alignItems={"flex-end"} bgColor={"lightgray"} p="1em">
        <Heading color="gray" size="md">
          Owner:
        </Heading>
        <HStack>
          <Identicon account={owner} />
          <Heading color="black" size="md">
            {trimAddress(owner, 4)}
          </Heading>
        </HStack>
      </Stack>
    </Stack>
  )
}
