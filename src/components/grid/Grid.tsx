import {
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Stack,
  Tooltip,
  useBreakpointValue,
  useDisclosure,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { BiSave } from "react-icons/bi"
import { BsArrowsMove } from "react-icons/bs"
import { GiHamburgerMenu } from "react-icons/gi"
import { ImBin } from "react-icons/im"
import { LuImageOff, LuImagePlus, LuPaintbrush2 } from "react-icons/lu"
import {
  PiCrosshairBold,
  PiEraserBold,
  PiMagnifyingGlassBold,
} from "react-icons/pi"
import { useGetPixels } from "../../utils/Subgraph"

import { useContract, useContractEvents, useSigner } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { useRouter } from "next/router"
import { FaPalette } from "react-icons/fa"
import { useLocalStorage } from "react-use"
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"
import { DPlaceGrid__factory } from "types"
import { useDebouncedCallback } from "use-debounce"
import { getColorOrDefault, getTextForColor } from "../../utils/utils"
import ManagePixels from "./ManagePixels"
import OwnedPixels from "./OwnedPixels"
import SelectedPixel from "./SelectedPixel"
import StencilManager from "./StencilManager"

export interface Pixel {
  x: number
  y: number
  color?: string
  price?: number
  owner?: string
  lastUpdated?: number
}

export default function Grid({ block }: { block: number }) {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const maxSpaces = 200
  const pixelSize = 1
  const currentGridImageUrl = "/assets/images/grid-0.png"

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const updateCanvasRef = useRef<HTMLCanvasElement>(null)
  const editCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stencilCanvasRef = useRef<HTMLCanvasElement>(null)
  const {
    isOpen: isPixelsOpen,
    onOpen: onPixelsOpen,
    onClose: onPixelsClose,
  } = useDisclosure()
  const {
    isOpen: isStencilOpen,
    onOpen: onStencilOpen,
    onClose: onStencilClose,
  } = useDisclosure()
  const [canvas, setCanvas] = useState<CanvasRenderingContext2D | null>(null)
  const [stencilCanvas, setStencilCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [updateCanvas, setUpdateCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [editCanvas, setEditCanvas] = useState<CanvasRenderingContext2D | null>(
    null,
  )
  const [size, setSize] = useState(0)
  const [newPixels, setNewPixels] = useState<Pixel[]>([])
  const [storagePixels, saveStoragePixels] = useLocalStorage("pixels", [])
  const [updatedPixels, setUpdatedPixels] = useState<Pixel[]>([])
  const [selectedPixel, setSelectedPixel] = useState<Pixel>()
  const [highlightedPixel, setHighlightedPixel] = useState<Pixel>()
  const [checkedPixel, setCheckedPixel] = useState<Pixel>()
  const [currentBlock, setCurrentBlock] = useState<number>(block)
  const { getPixels, loading: subgraphPixelsLoading } = useGetPixels()
  const [_loading, setLoading] = useState(false)
  const [tool, setTool] = useState("move")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [transformDisabled, setTransformDisabled] = useState(false)
  const [color, setColor] = useState("#FF4500")
  const [drawingPixels, setDrawingPixels] = useState(false)
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const signer = useSigner()
  const toast = useToast()
  const router = useRouter()

  let loading = subgraphPixelsLoading || _loading

  let isStencil = router.query.stencil != undefined

  let debounceToast = useDebouncedCallback(async (options: UseToastOptions) => {
    toast(options)
  }, 100)

  const { data } = useContractEvents(contract, "PixelChanged", {
    queryFilter: {
      order: "desc",
      fromBlock: currentBlock,
      toBlock: currentBlock + 100000,
    },
    subscribe: true,
  })

  useEffect(() => {
    if (storagePixels && saveStoragePixels && updateCanvas) {
      setUpdatedPixels(storagePixels)
      for (let i = 0; i < storagePixels.length; i++) {
        let pixel = storagePixels[i]
        setTimeout(() => {
          updateCanvas.fillStyle = pixel.color
          updateCanvas.fillRect(
            pixel.x * pixelSize,
            pixel.y * pixelSize,
            pixelSize,
            pixelSize,
          )
        }, 10)
      }
    }
  }, [saveStoragePixels, updateCanvas])

  // open drawers on desktop load
  useEffect(() => {
    if (!isMobile) {
      onPixelsOpen()
    }
  }, [isMobile])

  // draw canvas
  useEffect(() => {
    var gridImage = new Image()
    gridImage.src = currentGridImageUrl
    gridImage.onload = async () => {
      setSize(gridImage.width * pixelSize)
      if (canvas) {
        canvas.drawImage(gridImage, 0, 0, size, size)
        // Catch up grid from subgraph
        let timestamp = currentGridImageUrl.split("-")[1].split(".")[0]
        let pixels = await getPixels(Number(timestamp))
        setNewPixels(pixels)
        for (let i = 0; i < pixels.length; i++) {
          setTimeout(() => addNewPixel(pixels[i]), 1)
        }
      }
      if (
        canvasRef.current &&
        updateCanvasRef.current &&
        editCanvasRef.current &&
        stencilCanvasRef.current &&
        size > 0
      ) {
        let _canvas = canvasRef.current.getContext("2d")
        _canvas.shadowBlur = 0
        setCanvas(_canvas)
        setUpdateCanvas(updateCanvasRef.current.getContext("2d"))
        setEditCanvas(editCanvasRef.current.getContext("2d"))
        setStencilCanvas(stencilCanvasRef.current.getContext("2d"))
        if (!isStencil) {
          centerCanvasOnPixel({ x: 500, y: 500 }, 5)
        }
      }
    }
  }, [size, canvas])

  useEffect(() => {
    if (data) {
      for (let i = 0; i < data.length; i++) {
        let x = Number(data[i].data.x)
        let y = Number(data[i].data.y)
        let color = ethers.utils.parseBytes32String(data[i].data.data)
        setTimeout(() => addNewPixel({ x, y, color }), 1)
      }
    }
    let handler = async () => {
      let block = await signer.provider.getBlockNumber()
      setCurrentBlock(block)
    }
    if (signer) handler()
  }, [data])

  useEffect(() => {
    if (tool !== "select") {
      setSelectedPixel(undefined)
    }
    if (tool == "move") {
      setTransformDisabled(false)
    } else {
      setTransformDisabled(true)
    }
  }, [tool])

  function saveUpdatePixels(pixels: Pixel[]) {
    setUpdatedPixels([...pixels])
    saveStoragePixels([...pixels])
  }

  function getPixelFromCoordinates(xCord: number, yCord: number) {
    if (!updateCanvas || !transformComponentRef.current) return { x: 0, y: 0 }
    const bounding = updateCanvas.canvas.getBoundingClientRect()
    let scale = transformComponentRef.current.instance.transformState.scale
    const x = Math.floor((xCord - bounding.left) / scale / pixelSize)
    const y = Math.floor((yCord - bounding.top) / scale / pixelSize)
    return { x, y }
  }

  function addNewPixel(pixel: Pixel) {
    if (!canvas) return

    let newPixelIndex = newPixels.findIndex(
      (_pixel) => _pixel.x === pixel.x && _pixel.y === pixel.y,
    )
    if (newPixels[newPixelIndex]?.color === pixel.color) {
      return
    }
    let x = pixel.x
    let y = pixel.y
    let color = pixel.color
    // draw pixel on canvas

    if (color) {
      canvas.fillStyle = color
      canvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }

    if (newPixelIndex !== -1) {
      let _newPixels = newPixels
      _newPixels[newPixelIndex].color = pixel.color
      setNewPixels([..._newPixels])
    } else {
      let _newPixels = newPixels
      setNewPixels([..._newPixels, pixel])
    }
  }

  function updatePixel(x, y, _color) {
    setCheckedPixel({ x, y })
    if (!signer) {
      // open modal
    }
    let index = updatedPixels.findIndex(
      (pixel) => pixel.x === x && pixel.y === y,
    )
    // if pixel already being updated, update the color
    if (index !== -1) {
      let _updatedPixels = updatedPixels
      _updatedPixels[index].color = _color
      saveUpdatePixels(_updatedPixels)
      updateCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      updateCanvas.fillStyle = _color
      updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      return
    }
    if (updatedPixels.length == maxSpaces) {
      // toast.closeAll()
      debounceToast({
        status: "warning",
        description:
          "You have reached the maximum number of pixels to update per transaction.",
      })
      return
    }
    updateCanvas.fillStyle = _color
    updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    saveUpdatePixels([...updatedPixels, { x, y, color: _color }])
  }

  function confirmClaimPixels() {
    toast({
      title: `Pixels Claimed!`,
      description: `You have successfully claimed ${updatedPixels.length} pixels!`,
      status: "success",
      isClosable: true,
    })
    saveUpdatePixels([])
  }

  function removeUpdatedPixel(x: number, y: number) {
    setCheckedPixel({ x, y })
    updateCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)

    let index = updatedPixels.findIndex(
      (pixel) => pixel.x === x && pixel.y === y,
    )
    if (!updateCanvas || index == -1) {
      return
    }
    saveUpdatePixels([
      ...updatedPixels.filter((pixel) => !(pixel.x === x && pixel.y === y)),
    ])
  }

  function clearUpdatedPixels() {
    if (!updateCanvas) return
    saveUpdatePixels([])
    updateCanvas.clearRect(0, 0, size, size)
  }

  function selectPixel(x, y) {
    if (!isPixelsOpen) onPixelsOpen()
    setSelectedPixel({ x, y })
  }

  function clickPixel(event) {
    if (!updateCanvas || !transformComponentRef.current) {
      return
    }
    setShowColorPicker(false)
    let { x, y } = getPixelFromCoordinates(event.clientX, event.clientY)

    if (tool === "select") {
      selectPixel(x, y)
    } else if (tool === "update") {
      updatePixel(x, y, color)
    } else if (tool === "remove") {
      removeUpdatedPixel(x, y)
    }
  }

  function drawPixels(event) {
    if (!updateCanvas) return
    let { x, y } = event.touches
      ? getPixelFromCoordinates(
          event.touches[0].clientX,
          event.touches[0].clientY,
        )
      : getPixelFromCoordinates(event.clientX, event.clientY)

    if (checkedPixel && x == checkedPixel.x && y == checkedPixel.y) return

    if (!drawingPixels) {
      setTimeout(() => highlightPixel({ x, y }), 10)
      return
    }
    if (tool === "update") {
      updatePixel(x, y, color)
    } else if (tool === "remove") {
      removeUpdatedPixel(x, y)
    }
  }

  function highlightPixel(pixel: Pixel) {
    if (!editCanvas) return
    let { x, y } = pixel
    if (highlightedPixel?.x === x && highlightedPixel?.y === y) return
    if (highlightedPixel) {
      editCanvas.clearRect(0, 0, size, size)
    }
    editCanvas.fillStyle = tool == "update" ? color : "rgba(0, 0, 0, 0.2)"
    editCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    setHighlightedPixel({ x, y })
  }

  function unHighlightPixel() {
    if (highlightedPixel) {
      editCanvas.clearRect(0, 0, size, size)
    }
    setHighlightedPixel(undefined)
  }

  function enableDrawPixels(event) {
    if (tool == "remove") unHighlightPixel()
    if (tool == "move") return
    setDrawingPixels(true)
  }

  function disableDrawPixels(event) {
    unHighlightPixel()
    if (tool == "move") return
    setDrawingPixels(false)
  }

  function toggleColorPicker() {
    setShowColorPicker(!showColorPicker)
  }

  function toggleStencil() {
    if (isStencilOpen) {
      onStencilClose()
    } else {
      onStencilOpen()
    }
  }

  function centerCanvasOnPixel(pixel: Pixel, scale: number) {
    if (transformComponentRef.current) {
      let prevTransformDisabled = transformDisabled
      setTransformDisabled(false)
      const { setTransform } = transformComponentRef.current
      setTimeout(() => {
        const { innerWidth: width, innerHeight: height } = window
        let headerOffset = 100
        let xTrans = pixel.x * scale * pixelSize * -1 + width / 2
        let yTrans =
          pixel.y * scale * pixelSize * -1 + (height / 2 - headerOffset)
        setTransform(xTrans, yTrans, scale)
        setTransformDisabled(prevTransformDisabled)
      }, 100)
    }
  }

  let controls = (
    <HStack
      mt="1em"
      pos="absolute"
      left={isPixelsOpen ? "21em" : "1em"}
      top={isPixelsOpen ? "initial" : "88px"}
      alignItems="flex-start"
      gap="1em"
    >
      <Stack>
        <Tooltip label="Close Menu" placement="right">
          <IconButton
            aria-label="close"
            icon={<Icon as={GiHamburgerMenu} />}
            onClick={
              isPixelsOpen
                ? () => {
                    setSelectedPixel(undefined)
                    onPixelsClose()
                  }
                : () => {
                    onPixelsOpen()
                  }
            }
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
          />
        </Tooltip>
        <Tooltip label="Center Grid" placement="right">
          <IconButton
            aria-label="center"
            icon={<Icon as={PiCrosshairBold} />}
            onClick={() => {
              centerCanvasOnPixel({ x: 500, y: 500 }, 5)
              setShowColorPicker(false)
            }}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
          />
        </Tooltip>
        <Tooltip label="View Pixel" placement="right">
          <IconButton
            aria-label="select"
            icon={<Icon as={PiMagnifyingGlassBold} />} // TODO: change to magnifying glass
            bgColor={tool === "select" ? "#FF4500" : ""}
            color={tool === "select" ? "white" : ""}
            onClick={() => {
              setTool("select")
              setShowColorPicker(false)
            }}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
          />
        </Tooltip>
        <Tooltip label="Move" placement="right">
          <IconButton
            aria-label="move"
            icon={<Icon as={BsArrowsMove} />}
            bgColor={tool === "move" ? "#FF4500" : ""}
            color={tool === "move" ? "white" : ""}
            onClick={() => {
              setTool("move")
              setShowColorPicker(false)
            }}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
          />
        </Tooltip>
        <Tooltip label="Paint" placement="right">
          <IconButton
            aria-label="update"
            icon={<Icon as={LuPaintbrush2} />}
            bgColor={tool === "update" ? color : ""}
            color={tool === "update" ? getTextForColor(color) : ""}
            onClick={() => {
              setTool("update")
              setShowColorPicker(false)
            }}
            _hover={{ backgroundColor: color, color: getTextForColor(color) }}
          />
        </Tooltip>
        {(tool == "update" || tool == "remove") && (
          <>
            <Tooltip label="Toggle Color Picker" placement="right">
              <IconButton
                aria-label="show-color-picker"
                icon={<Icon as={FaPalette} />}
                onClick={toggleColorPicker}
              />
            </Tooltip>
            <Tooltip label="Eraser" placement="right">
              <IconButton
                aria-label="remove"
                icon={<Icon as={PiEraserBold} />}
                bgColor={tool === "remove" ? "#FF4500" : ""}
                color={tool === "remove" ? "white" : ""}
                onClick={() => {
                  setTool("remove")
                  setShowColorPicker(false)
                }}
                _hover={{ backgroundColor: "#FF4500", color: "white" }}
              />
            </Tooltip>
          </>
        )}
        {updatedPixels.length > 0 && (
          <Tooltip label="Clear Updates" placement="right">
            <IconButton
              aria-label="clear"
              icon={<Icon as={ImBin} />}
              onClick={() => {
                clearUpdatedPixels()
                setShowColorPicker(false)
              }}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
            />
          </Tooltip>
        )}
        {!isPixelsOpen && updatedPixels.length > 0 && (
          <Tooltip label="Save Updates" placement="right">
            <IconButton
              aria-label="save"
              icon={<Icon as={BiSave} />}
              onClick={onPixelsOpen}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
            />
          </Tooltip>
        )}
        <Tooltip label="Stencils" placement="right">
          <IconButton
            aria-label="stencils"
            icon={<Icon as={LuImagePlus} />}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
            onClick={() => {
              toggleStencil()
              setShowColorPicker(false)
            }}
          />
        </Tooltip>
        {isStencil && (
          <Tooltip label="Remove Stencil" placement="right">
            <IconButton
              aria-label="remove-stencil"
              icon={<Icon as={LuImageOff} />}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
              onClick={() => {
                router.push("/")
                stencilCanvas.clearRect(0, 0, size, size)
                centerCanvasOnPixel({ x: 500, y: 500 }, 10)
                setShowColorPicker(false)
              }}
            />
          </Tooltip>
        )}
      </Stack>
      {(tool == "update" || tool == "remove") && showColorPicker && (
        <Stack>
          <HexColorPicker color={color} onChange={setColor} />
          <Editable value={color}>
            <EditablePreview />
            <EditableInput
              onChange={(e) => setColor(getColorOrDefault(e.target.value))}
            />
          </Editable>
        </Stack>
      )}
    </HStack>
  )

  return (
    <TransformWrapper
      ref={transformComponentRef}
      limitToBounds={false}
      minScale={0.1}
      maxScale={20}
      doubleClick={{ disabled: true }}
      centerOnInit={true}
      panning={{ velocityDisabled: true, disabled: transformDisabled }}
      wheel={{ step: 0.001, smoothStep: 0.005 }}
    >
      {({ instance }) => {
        return (
          <Stack overflowY={"hidden"}>
            <Stack
              w="100%"
              overflow={"hidden"}
              maxH={"calc(100vh - 88px)"}
              mt="88px"
            >
              <TransformComponent wrapperStyle={{ width: "100%" }}>
                <canvas
                  ref={canvasRef}
                  width={size}
                  height={size}
                  id="grid"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    imageRendering: "pixelated",
                    cursor: tool === "move" ? "pointer" : "crosshair",
                    position: "absolute",
                    zIndex: 10000,
                  }}
                />
                <canvas
                  ref={stencilCanvasRef}
                  width={size}
                  height={size}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    imageRendering: "pixelated",
                    cursor: tool === "move" ? "pointer" : "crosshair",
                    position: "absolute",
                    zIndex: 10000,
                  }}
                />
                <canvas
                  ref={updateCanvasRef}
                  width={size}
                  height={size}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    imageRendering: "pixelated",
                    cursor: tool === "move" ? "pointer" : "crosshair",
                    position: "relative",
                    zIndex: 10000,
                  }}
                />
                <canvas
                  ref={editCanvasRef}
                  width={size}
                  height={size}
                  onClick={clickPixel}
                  onMouseMoveCapture={drawPixels}
                  onTouchMoveCapture={drawPixels}
                  onMouseDown={enableDrawPixels}
                  onTouchStart={enableDrawPixels}
                  onMouseLeave={disableDrawPixels}
                  onMouseOutCapture={disableDrawPixels}
                  onMouseUp={disableDrawPixels}
                  onTouchEnd={disableDrawPixels}
                  onTouchCancel={disableDrawPixels}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    imageRendering: "pixelated",
                    cursor: tool === "move" ? "pointer" : "crosshair",
                    position: "absolute",
                    zIndex: 10000,
                  }}
                />
              </TransformComponent>
            </Stack>
            {loading && (
              <Center
                backgroundColor="#00000012"
                pos="absolute"
                w={"100vw"}
                h={"100vh"}
              >
                <Spinner />
              </Center>
            )}
            {!isPixelsOpen && controls}
            <Drawer
              placement={"left"}
              onClose={onPixelsClose}
              isOpen={isPixelsOpen}
              closeOnOverlayClick={false}
              blockScrollOnMount={false}
            >
              <DrawerOverlay display="none" />
              <DrawerContent containerProps={{ width: "0" }}>
                <DrawerBody
                  bgColor="#FF4500"
                  mt="5.5em"
                  p="1em"
                  pt="0 !important"
                >
                  <Stack
                    w="100%"
                    bgColor="transparent"
                    h="100%"
                    justifyContent={"space-between"}
                  >
                    {controls}
                    <Stack>
                      <ManagePixels
                        confirmClaimPixels={confirmClaimPixels}
                        removePixel={removeUpdatedPixel}
                        updatedPixels={updatedPixels}
                        maxSpaces={maxSpaces}
                        setLoading={setLoading}
                      />
                      <OwnedPixels centerOn={centerCanvasOnPixel} />
                    </Stack>
                    {selectedPixel && (
                      <SelectedPixel
                        pixel={selectedPixel}
                        setUpdateColor={setColor}
                      />
                    )}
                  </Stack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            <Drawer
              blockScrollOnMount={false}
              placement={"right"}
              onClose={onStencilClose}
              isOpen={isStencilOpen}
              closeOnOverlayClick={false}
            >
              <DrawerContent containerProps={{ width: "0" }} overflow="scroll">
                <DrawerBody
                  bgColor="#FF4500"
                  mt="5.5em"
                  p="1em"
                  pt="0 !important"
                >
                  <Stack
                    w="100%"
                    bgColor="transparent"
                    h="100%"
                    justifyContent={"space-between"}
                  >
                    <StencilManager
                      centerOn={centerCanvasOnPixel}
                      stencilCanvas={stencilCanvas}
                    />
                  </Stack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Stack>
        )
      }}
    </TransformWrapper>
  )
}
