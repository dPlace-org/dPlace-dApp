import { getTextForColor } from "@/utils/utils"
import {
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { useContract, useSigner, Web3Button } from "@thirdweb-dev/react"
import { track } from "@vercel/analytics"
import { ethers } from "ethers"
import { useCallback, useEffect, useMemo, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { BiImage, BiSolidGridAlt } from "react-icons/bi"
import { BsArrowsMove } from "react-icons/bs"
import {
  FaEye,
  FaEyeDropper,
  FaEyeSlash,
  FaPalette,
  FaQuestionCircle,
  FaRegImages,
} from "react-icons/fa"
import { ImBin } from "react-icons/im"
import { LuPaintbrush2 } from "react-icons/lu"
import {
  PiCrosshairBold,
  PiEraserBold,
  PiMagnifyingGlassBold,
} from "react-icons/pi"
import { DPlaceGrid__factory } from "types"
import { useDebouncedCallback } from "use-debounce"
import useEyeDropper from "use-eye-dropper"
import { useCalculatePriceUSD } from "../../utils/Price"
import { getColorOrDefault } from "../../utils/utils"
import { Pixel } from "./Grid"
import OwnedPixels from "./OwnedPixels"

interface Props {
  tool: string
  setTool: (tool: string) => void
  updatedPixels: Pixel[]
  hasStencil: boolean
  showingStencil: boolean
  showColorPicker: boolean
  selectedColor: string
  centerCanvasOnPixel: (pixel: Pixel, scale: number) => void
  setSelectedColor: (color: string) => void
  clearDrawnPixels(): void
  setShowColorPicker(val: boolean): void
  toggleStencil(): void
  toggleShowStencil(): void
  setLoading(val: boolean): void
  confirmClaimPixels(): void
}

export default function GridControls({
  tool,
  selectedColor,
  hasStencil,
  showingStencil,
  showColorPicker,
  updatedPixels,
  setTool,
  setSelectedColor,
  centerCanvasOnPixel,
  clearDrawnPixels,
  setShowColorPicker,
  toggleStencil,
  toggleShowStencil,
  setLoading,
  confirmClaimPixels,
}: Props) {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const { open, isSupported } = useEyeDropper()
  const [menu, setMenu] = useState("move")

  const pickMenu = (option: string) => {
    if (menu == option) return
    else setMenu(option)
  }

  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()
  const [priceBigNumber, setPriceBigNumber] = useState<ethers.BigNumber>(
    ethers.BigNumber.from(0),
  )
  const [price, setPrice] = useState("0.0")
  const [priceLoading, setPriceLoading] = useState(false)
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  const signer = useSigner()
  const { usdPrice } = useCalculatePriceUSD({ ethAmount: price })

  const {
    isOpen: isOwnedOpen,
    onOpen: onOwnedOpen,
    onClose: onOwnedClose,
  } = useDisclosure()

  let xs = updatedPixels.map((pixel) => pixel.x)
  let ys = updatedPixels.map((pixel) => pixel.y)

  const pickColor = useCallback(() => {
    // Using async/await (can be used as a promise as-well)
    const openPicker = async () => {
      try {
        setShowColorPicker(false)
        const color = await open()
        setSelectedColor(color.sRGBHex)
        setTool("paint")
      } catch (e) {
        console.log(e)
        // Ensures component is still mounted
      }
    }
    openPicker()
  }, [open])

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

  useEffect(() => {
    if (tool === "move") {
      setMenu("move")
    }
    if (tool === "paint") {
      setMenu("paint")
    }
  }, [tool])

  let subcontrols = menu && (
    <Stack
      pos="absolute"
      p="1em"
      top="0"
      h="100%"
      marginLeft={"-72px"}
      borderStartRadius={"1em"}
      backdropFilter="blur(6px)"
      backgroundColor="#000000c9"
    >
      {menu === "move" ? (
        <>
          <Tooltip label="Center Grid" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="center"
              icon={<Icon as={PiCrosshairBold} />}
              onClick={() => {
                centerCanvasOnPixel({ x: 500, y: 500 }, 5)
              }}
            />
          </Tooltip>
          <Tooltip label="View Pixel" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="select"
              icon={<Icon as={PiMagnifyingGlassBold} />}
              bgColor={tool === "select" ? "#FF4500" : ""}
              color={tool === "select" ? "white" : ""}
              onClick={() => {
                setTool("select")
                setShowColorPicker(false)
              }}
            />
          </Tooltip>
          <Tooltip label="Owned Pixels" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="owned"
              icon={<Icon as={BiSolidGridAlt} />}
              onClick={() => {
                isOwnedOpen ? onOwnedClose() : onOwnedOpen()
                setShowColorPicker(false)
              }}
            />
          </Tooltip>
        </>
      ) : menu === "paint" ? (
        <>
          <Tooltip label="Toggle Color Picker" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="show-color-picker"
              icon={<Icon as={FaPalette} />}
              onClick={() => {
                if (!showColorPicker) setTool("paint")
                setShowColorPicker(!showColorPicker)
              }}
              bgColor={showColorPicker ? "#FF4500 !important" : ""}
              color={showColorPicker ? "white" : ""}
            />
          </Tooltip>
          <Tooltip label="Eraser" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="remove"
              icon={<Icon as={PiEraserBold} />}
              bgColor={tool === "remove" ? "#FF4500 !important" : ""}
              color={tool === "remove" ? "white" : ""}
              onClick={() => {
                console.log(tool)
                tool == "remove" ? setTool("paint") : setTool("remove")
                setShowColorPicker(false)
              }}
            />
          </Tooltip>
          <Tooltip label="Clear Updates" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="clear"
              icon={<Icon as={ImBin} />}
              onClick={() => {
                clearDrawnPixels()
              }}
            />
          </Tooltip>
        </>
      ) : (
        menu === "stencils" && (
          <>
            <Tooltip label="View Stencils" placement="right">
              <IconButton
                _hover={{ backgroundColor: "" }}
                aria-label="Stencils"
                icon={<Icon as={FaRegImages} />}
                onClick={() => {
                  toggleStencil()
                }}
              />
            </Tooltip>
            {/* <Tooltip label="Add Stencils" placement="right">
              <IconButton
                _hover={{ backgroundColor: "" }}
                aria-label="Add Stencils"
                icon={<Icon as={LuImagePlus} />}
                onClick={() => {
                  // TODO: open add stencil modal
                }}
              />
            </Tooltip> */}
            {hasStencil && (
              <Tooltip
                label={!showingStencil ? "Show Stencil" : "Hide Stencil"}
                placement="right"
              >
                <IconButton
                  _hover={{ backgroundColor: "" }}
                  aria-label="hide-stencil"
                  icon={<Icon as={showingStencil ? FaEyeSlash : FaEye} />}
                  onClick={() => {
                    toggleShowStencil()
                  }}
                />
              </Tooltip>
            )}
          </>
        )
      )}
      <OwnedPixels
        isOpen={isOwnedOpen}
        onClose={onOwnedClose}
        centerOn={centerCanvasOnPixel}
      />
    </Stack>
  )

  return (
    <Stack
      pos="absolute"
      bottom={{ md: "3em", sm: "1em" }}
      left="50%"
      transform={
        menu ? "translate(calc(-50% + 36px), 0%)" : "translate(-50%, 0%)"
      }
    >
      {subcontrols}
      <Stack
        maxW="30em"
        w="100%"
        minH="10em"
        borderRadius={"1em"}
        borderStartRadius={menu ? "0" : "1em"}
        backdropFilter="blur(6px)"
        backgroundColor="#000000ad"
        padding="1em"
      >
        <HStack spacing={"1em"}>
          <Stack alignSelf={{ md: "center", sm: "flex-start" }}>
            <Tooltip label="Move" placement="right">
              <IconButton
                _hover={{ backgroundColor: "" }}
                aria-label="move"
                icon={<Icon as={BsArrowsMove} />}
                bgColor={menu === "move" ? "#FF4500" : ""}
                color={menu === "move" ? "white" : ""}
                onClick={() => {
                  setTool("move")
                  pickMenu("move")
                  setShowColorPicker(false)
                }}
              />
            </Tooltip>
            <Tooltip label="Paint" placement="right">
              <IconButton
                _hover={{ backgroundColor: "" }}
                aria-label="paint"
                icon={<Icon as={LuPaintbrush2} />}
                bgColor={menu === "paint" ? selectedColor : ""}
                color={menu === "paint" ? getTextForColor(selectedColor) : ""}
                onClick={() => {
                  setTool("paint")
                  pickMenu("paint")
                  setShowColorPicker(false)
                }}
              />
            </Tooltip>
            <Tooltip label="Stencils" placement="right">
              <IconButton
                _hover={{ backgroundColor: "" }}
                aria-label="stencils"
                icon={<Icon as={BiImage} />}
                bgColor={menu === "stencils" ? "#FF4500" : ""}
                color={menu === "stencils" ? "white" : ""}
                onClick={() => {
                  pickMenu("stencils")
                  setShowColorPicker(false)
                }}
              />
            </Tooltip>
          </Stack>
          <Stack
            color="white"
            spacing="1em"
            ml="1em"
            direction={{ md: "row", sm: "column" }}
          >
            <Stack spacing={0} alignItems="center">
              <Text
                w="87px"
                textAlign={"center"}
                fontFamily={"minecraft"}
                fontSize="5xl"
              >
                {updatedPixels.length}
              </Text>
              <Text mt="-24px" fontFamily={"minecraft"} fontSize="2xl">
                Pixels
              </Text>
              <Tooltip
                label="The more pixels you try to claim the higher the chance your transaction will fail."
                placement="right"
              >
                <HStack mt="-8px" spacing="0">
                  <Text
                    fontFamily={"minecraft"}
                    w="fit-content"
                    color="#bdbdbd"
                    mt="0"
                    fontSize={"13px"}
                  >
                    <span style={{ fontWeight: "bold" }}>Max:</span> 200
                  </Text>
                  <Icon
                    fontSize="xs"
                    mt="-5px"
                    as={FaQuestionCircle}
                    color="#bdbdbd"
                  />
                </HStack>
              </Tooltip>
            </Stack>
            {isMobile && (
              <Divider
                my="-12px"
                borderColor="black"
                opacity=".3"
                borderWidth={"1px"}
              />
            )}
            <Stack alignSelf={{ md: "flex-end", sm: "center" }}>
              {priceLoading ? (
                <HStack>
                  <span style={{ fontFamily: "minecraft" }}>Total:</span>
                  <Spinner size="sm" />
                </HStack>
              ) : (
                <Text my="-4px" fontSize={"1em"}>
                  <span style={{ fontFamily: "minecraft" }}>Total:</span>
                  <span style={{ fontWeight: "initial" }}> Ξ{price}</span>
                  <span style={{ fontSize: "12px", color: "#bdbdbd" }}>
                    {" "}
                    (${usdPrice})
                  </span>
                </Text>
              )}
              <Web3Button
                contractAddress={gridAddress}
                contractAbi={DPlaceGrid__factory.abi}
                isDisabled={updatedPixels.length === 0}
                style={{
                  fontFamily: "minecraft",
                  letterSpacing: "1px",
                  fontSize: "18px",
                  backgroundColor:
                    updatedPixels.length > 0 || !signer ? "#FF4500" : "",
                  color: updatedPixels.length > 0 || !signer ? "white" : "gray",
                  minWidth: "10em",
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
                    track("pixels-claimed", {
                      signer: await signer?.getAddress(),
                      pixels: xs.length,
                      cost: ethers.utils.formatEther(newestPrice),
                    })
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
                      position: "top-right",
                      containerStyle: {
                        marginTop: "120px",
                      },
                    })
                    track("pixel-claim-error", {
                      signer: await signer?.getAddress(),
                      pixels: xs.length,
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
        </HStack>
      </Stack>
      {showColorPicker && (
        <Stack position="absolute" bottom="102%" left="-72px">
          <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
          <HStack>
            {isSupported && (
              <IconButton
                _hover={{ backgroundColor: "" }}
                aria-label="color-picker"
                icon={<Icon as={FaEyeDropper} />}
                onClick={() => {
                  pickColor()
                }}
              />
            )}
            <Editable value={selectedColor}>
              <EditablePreview />
              <EditableInput
                onChange={(e) =>
                  setSelectedColor(getColorOrDefault(e.target.value))
                }
              />
            </Editable>
          </HStack>
        </Stack>
      )}
    </Stack>
  )
}
