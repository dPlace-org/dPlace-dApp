import { Heading, HStack, Stack, Text } from "@chakra-ui/react"
import { useSigner } from "@thirdweb-dev/react"
import { useEffect, useState } from "react"
import { useGetOwnedPixels } from "../../utils/Subgraph"
import { getTextForColor } from "../../utils/utils"
import { Pixel } from "./Grid"

export default function OwnedPixels({
  centerOn,
}: {
  centerOn: (pixel: Pixel, scale: number) => void
}) {
  const [ownedPixels, setOwnedPixels] = useState<Pixel[]>([])

  const { getOwnedPixels } = useGetOwnedPixels()
  const signer = useSigner()

  useEffect(() => {
    let handler = async () => {
      if (!signer || !getOwnedPixels) return
      console.log("getting owned pixels")
      let pixels = await getOwnedPixels(
        (await signer.getAddress()).toLowerCase(),
      )
      setOwnedPixels(pixels)
    }
    handler()
  }, [signer])

  if (ownedPixels.length === 0) return

  return (
    <Stack
      bgColor="white"
      boxShadow="inset 0px 5px 5px rgb(0 0 0 / 28%)"
      p="1em"
    >
      <Heading
        mt="10px"
        fontSize={"1.5em"}
        fontFamily="minecraft"
        letterSpacing={"1px"}
      >
        Owned Pixels
      </Heading>
      <HStack
        whiteSpace={"nowrap"}
        overflow={"auto"}
        pt="1.5em"
        mt="-.5em"
        minH="105px"
      >
        {ownedPixels.map((pixel, index) => (
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
              onClick={() => {
                centerOn(pixel, 20)
              }}
              cursor="pointer"
            >
              <Text fontFamily={"minecraft"}>{pixel.x}</Text>
              <Text fontFamily={"minecraft"}>{pixel.y}</Text>
            </Stack>
          </Stack>
        ))}
      </HStack>
    </Stack>
  )
}
