import { Heading, HStack, Spinner, Stack, Text } from "@chakra-ui/react"
import { useSigner } from "@thirdweb-dev/react"
import { useEffect, useState } from "react"
import { useGetOwnedPixels } from "../../utils/Subgraph"
import { getTextForColor } from "../../utils/utils"
import { Pixel } from "./Grid"

export default function OwnedPixels({
  centerOn,
  isOpen,
  onClose,
}: {
  centerOn: (pixel: Pixel, scale: number) => void
  isOpen: boolean
  onClose: () => void
}) {
  const [ownedPixels, setOwnedPixels] = useState<Pixel[]>([])
  const [fetched, setFetched] = useState(false)
  const { getOwnedPixels, loading } = useGetOwnedPixels()
  const signer = useSigner()

  useEffect(() => {
    let handler = async () => {
      if (!signer || !getOwnedPixels) return
      setFetched(true)
      let pixels = await getOwnedPixels(
        (await signer.getAddress()).toLowerCase(),
      )
      setOwnedPixels(pixels)
    }
    if (!fetched) handler()
  }, [signer, getOwnedPixels])

  return (
    <Stack pos="absolute" top="-150px" display={isOpen ? "" : "none"}>
      <Heading
        mt="10px"
        fontSize={"1.5em"}
        fontFamily="minecraft"
        letterSpacing={"1px"}
        w="fit-content"
      >
        Owned Pixels
      </Heading>
      <HStack
        whiteSpace={"nowrap"}
        overflow={"auto"}
        pt="1.5em"
        mt="-.5em"
        minH="105px"
        w="25em"
      >
        {loading && <Spinner />}
        {ownedPixels.length === 0 && (
          <Text fontFamily={"minecraft"}>No owned pixels</Text>
        )}
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
                onClose()
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
