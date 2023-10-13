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
import { Place } from "./Grid"

interface ManagePlacesProps {
  removePlace: (x: number, y: number) => void
  updatedPlaces: Place[]
  maxSpaces: number
  confirmClaimPlaces: () => void
  clearUpdatedPlaces: () => void
}

export default function ManagePlaces(props: ManagePlacesProps) {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const {
    removePlace,
    updatedPlaces,
    clearUpdatedPlaces,
    maxSpaces,
    confirmClaimPlaces,
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

  let xs = updatedPlaces.map((place) => place.x)
  let ys = updatedPlaces.map((place) => place.y)

  let getPrice = useDebouncedCallback(async (xs: number[], ys: number[]) => {
    setPriceLoading(true)
    try {
      let _price = await contract.call("calculatePlacesPrice", [xs, ys])
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
  }, [updatedPlaces])

  return (
    <Stack bgColor="white" boxShadow="inset 0px 5px 5px rgb(0 0 0 / 28%)">
      <Stack m="1em">
        {/* <Heading mt="1em" fontSize={"1.5em"}>
          Your Places
        </Heading> */}

        <Heading
          mt="10px"
          fontSize={"1.5em"}
          fontFamily="minecraft"
          letterSpacing={"1px"}
        >
          Updated Places ({updatedPlaces.length})
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
          {updatedPlaces.length > 0 && (
            <Button size="sm" onClick={clearUpdatedPlaces}>
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
          {updatedPlaces.map((place, index) => (
            <Stack key={index} bgColor={place.color}>
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
                  onClick={() => removePlace(place.x, place.y)}
                  icon={<Icon as={FaTimes} />}
                  alignSelf="flex-end"
                  marginRight="-1em"
                />
                <Text>{place.x}</Text>
                <Text>{place.y}</Text>
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
          isDisabled={updatedPlaces.length === 0}
          action={async (_contract) => {
            if (!priceBigNumber) return
            let colors = updatedPlaces.map((place) =>
              ethers.utils.formatBytes32String(place.color),
            )
            try {
              // await (
              //   await signer.sendTransaction({
              //     to: ethers.constants.AddressZero,
              //     data: "0x",
              //     value: 0,
              //   })
              // ).wait()
              // let tx = contract.prepare("claimPlaces", [xs, ys, colors], {
              //   value: priceBigNumber,
              // })
              // console.log((await tx.estimateGasCost()).ether)
              await _contract.call("claimPlaces", [xs, ys, colors], {
                value: priceBigNumber,
                // gasLimit: limit,
              })
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
            confirmClaimPlaces()
          }}
        >
          Claim Places
        </Web3Button>
      </Stack>
    </Stack>
  )
}
