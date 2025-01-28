import { getColorOrDefault, getTextForColor } from "@/utils/utils"
import {
  Button,
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

import { calculatePixelsCost } from "@/utils/Canvas"
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit"

import { coinWithBalance, Transaction } from "@mysten/sui/transactions"

import { track } from "@vercel/analytics"
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
import { useDebouncedCallback } from "use-debounce"
import useEyeDropper from "use-eye-dropper"
import { useCalculatePriceUSD } from "../../utils/Price"
import { Pixel } from "./Grid"
import OwnedPixels from "./OwnedPixels"

interface Props {
  tool: string
  setTool: (tool: string) => void
  updatedPixels: Pixel[]
  hasStencil: boolean
  showingStencil: boolean
  showColorPicker: boolean
  loading: boolean
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
  loading,
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
  const account = useCurrentAccount()

  const pickMenu = (option: string) => {
    if (menu == option) return
    else setMenu(option)
  }

  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()
  const [price, setPrice] = useState(0)
  const [inputColor, setInputColor] = useState(selectedColor)
  const [hasSufficientBalance, setHasSufficientBalance] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const client = useSuiClient()
  const { usdPrice } = useCalculatePriceUSD({
    suiAmount: (price / 10 ** 9).toString(),
  })
  const { mutate } = useSignAndExecuteTransaction()

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
      let cost = await calculatePixelsCost(client, account.address, xs, ys)
      let balance = await client.getBalance({ owner: account.address })

      setHasSufficientBalance(Number(balance?.totalBalance) > cost)
      setPrice(cost)
    } catch (e) {
      console.log(e)
    }
    setPriceLoading(false)
  }, 100)

  useMemo(() => {
    let handler = async () => {
      if (xs.length === 0 && ys.length === 0) {
        setPrice(0)
        return
      }
      await getPrice(xs, ys)
    }
    handler()
  }, [updatedPixels, account])

  useEffect(() => {
    if (tool === "move") {
      setMenu("move")
    }
    if (tool === "paint") {
      setMenu("paint")
    }
  }, [tool])

  useEffect(() => {
    setSelectedColor(getColorOrDefault(inputColor))
  }, [inputColor])

  const handle_paint_pixels = async () => {
    if (!price) return
    try {
      setLoading(true)
      let newestPrice = await calculatePixelsCost(
        client,
        account.address,
        xs,
        ys,
      )

      let colors = updatedPixels.map((pixel) => pixel.color)

      // Create and execute transaction
      const tx = new Transaction()
      tx.setSender(account?.address)

      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::meta_canvas::paint_pixels`,
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_META_CANVAS_ID),
          tx.pure.vector("u64", xs),
          tx.pure.vector("u64", ys),
          tx.pure.vector("string", colors),
          tx.object("0x6"),
          coinWithBalance({ balance: newestPrice, useGasCoin: true }),
        ],
      })

      // Execute transaction
      await mutate(
        {
          transaction: tx,
          chain: "sui:testnet",
        },
        {
          onError: (error) => {
            console.log(error)
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
              signer: account.address,
              pixels: xs.length,
              error: error as any,
            })
          },
          onSuccess: () => {
            // vercel analytics
            track("pixels-claimed", {
              signer: account.address,
              pixels: xs.length,
              cost: newestPrice,
            })
            setLoading(false)
            confirmClaimPixels()
          },
        },
      )
    } catch (e: any) {
      return
    }
  }

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
                centerCanvasOnPixel({ x: 90, y: 90 }, 5)
              }}
            />
          </Tooltip>
          <Tooltip label="View Pixel" placement="right">
            <IconButton
              _hover={{ backgroundColor: "" }}
              aria-label="select"
              icon={<Icon as={PiMagnifyingGlassBold} />}
              bgColor={tool === "select" ? "#4ca3ff" : ""}
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
              bgColor={showColorPicker ? "#4ca3ff !important" : ""}
              color={showColorPicker ? "white" : ""}
            />
          </Tooltip>
          <Tooltip label="Eraser" placement="right">
            <IconButton
              isDisabled={loading}
              _hover={{ backgroundColor: "" }}
              aria-label="remove"
              icon={<Icon as={PiEraserBold} />}
              bgColor={tool === "remove" ? "#4ca3ff !important" : ""}
              color={tool === "remove" ? "white" : ""}
              onClick={() => {
                tool == "remove" ? setTool("paint") : setTool("remove")
                setShowColorPicker(false)
              }}
            />
          </Tooltip>
          {updatedPixels.length > 0 && (
            <Tooltip label="Clear Updates" placement="right">
              <IconButton
                isDisabled={loading}
                _hover={{ backgroundColor: "" }}
                aria-label="clear"
                icon={<Icon as={ImBin} />}
                onClick={() => {
                  clearDrawnPixels()
                }}
              />
            </Tooltip>
          )}
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
    <>
      {hasStencil && (
        <Stack position="absolute" left="14px" top="106px">
          <Tooltip
            label={!showingStencil ? "Show Stencil" : "Hide Stencil"}
            placement="right"
            defaultIsOpen={true}
          >
            <IconButton
              backgroundColor="#4ca3ff"
              _selected={{ backgroundColor: "#4ca3ff" }}
              color="white"
              aria-label="hide-stencil"
              icon={<Icon as={showingStencil ? FaEyeSlash : FaEye} />}
              onClick={() => {
                toggleShowStencil()
              }}
            />
          </Tooltip>
        </Stack>
      )}
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
                  bgColor={menu === "move" ? "#4ca3ff" : ""}
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
                  isDisabled={loading}
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
                  bgColor={menu === "stencils" ? "#4ca3ff" : ""}
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
                  label="Claiming more pixels at once increases the chance your transaction will fail."
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
                <Stack style={{ flexWrap: "nowrap" }} maxW="12em">
                  {priceLoading ? (
                    <HStack>
                      <span style={{ fontFamily: "minecraft" }}>Total:</span>
                      <Spinner size="sm" />
                    </HStack>
                  ) : (
                    <Text w="180px" my="-2px" fontSize={"1em"}>
                      <span style={{ fontFamily: "minecraft" }}>Total:</span>
                      <span
                        style={{
                          fontWeight: "initial",
                          display: "inline-flex",
                          maxWidth: "75px",
                          overflow: "hidden",
                        }}
                      >
                        {" "}
                        💧{price / 10 ** 9}
                      </span>
                      <span style={{ fontSize: "12px", color: "#bdbdbd" }}>
                        {" "}
                        (${usdPrice})
                      </span>
                    </Text>
                  )}
                </Stack>

                <Button
                  isDisabled={
                    updatedPixels.length === 0 || !hasSufficientBalance
                  }
                  style={{
                    fontFamily: "minecraft",
                    letterSpacing: "1px",
                    fontSize: "18px",
                    backgroundColor:
                      updatedPixels.length == 0 ||
                      !account ||
                      !hasSufficientBalance
                        ? "#004690"
                        : "#0d65c2",
                    color:
                      updatedPixels.length > 0 || !account ? "white" : "gray",
                    minWidth: "10em",
                  }}
                  onClick={async () => await handle_paint_pixels()}
                >
                  Claim Pixels
                </Button>
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
              <Editable value={inputColor}>
                <EditablePreview />
                <EditableInput
                  onChange={(e) => setInputColor(e.target.value)}
                />
              </Editable>
            </HStack>
          </Stack>
        )}
      </Stack>
    </>
  )
}
