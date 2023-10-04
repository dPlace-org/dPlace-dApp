import { DPlaceGrid__factory } from "@/types/index"
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
} from "@chakra-ui/react"
import { useContract, useContractRead, Web3Button } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { useState } from "react"
import { FaTimes } from "react-icons/fa"
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
  const [totalPriceUSD, setTotalPriceUSD] = useState<string>("0.0")
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  let xs = updatedPlaces.map((place) => place.x)
  let ys = updatedPlaces.map((place) => place.y)
  const {
    data: price,
    isLoading: isPriceLoading,
    error: priceError,
  } = useContractRead(contract, "calculatePlacesPrice", [xs, ys])

  const priceString = ethers.utils.formatEther(price || 0)

  return (
    <Stack bgColor="white" boxShadow="inset 0px 5px 5px rgb(0 0 0 / 28%)">
      <Stack m="1em">
        {/* <Heading mt="1em" fontSize={"1.5em"}>
          Your Places
        </Heading> */}

        <Heading
          mt="1em"
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
          <Button size="sm" onClick={clearUpdatedPlaces}>
            Clear
          </Button>
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
          {isPriceLoading ? (
            <Spinner />
          ) : (
            <>
              <span style={{ fontWeight: "initial" }}>Ξ{priceString}</span>
              <span style={{ fontSize: "15px", color: "gray" }}>
                {" "}
                (${totalPriceUSD})
              </span>
            </>
          )}
        </Heading>
        <Web3Button
          contractAddress={gridAddress}
          contractAbi={DPlaceGrid__factory.abi}
          isDisabled={updatedPlaces.length === 0}
          action={async (contract) => {
            let colors = updatedPlaces.map((place) =>
              ethers.utils.formatBytes32String(place.color),
            )

            try {
              await contract.call("claimPlaces", [xs, ys, colors], {
                value: price || 0,
              })
            } catch (e) {
              console.log(e)
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
