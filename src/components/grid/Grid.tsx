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
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { BiSave } from "react-icons/bi"
import { BsArrowsMove } from "react-icons/bs"
import { GiHamburgerMenu } from "react-icons/gi"
import { ImBin } from "react-icons/im"
import { LuPaintbrush2 } from "react-icons/lu"
import { PiCrosshairBold, PiEraserBold } from "react-icons/pi"
import { useGetPixels } from "../../utils/Subgraph"

import { useContract, useContractEvents, useSigner } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import { FaPalette } from "react-icons/fa"
import { LiaHandPointer } from "react-icons/lia"
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"
import { DPlaceGrid__factory } from "types"
import ManagePixels from "./ManagePixels"
import SelectedPixel from "./SelectedPixel"

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
  const maxSpaces = 100
  const pixelSize = 4
  const currentGridImageUrl = "/assets/images/grid-0.png"

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const updateCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [canvas, setCanvas] = useState<CanvasRenderingContext2D | null>(null)
  const [updateCanvas, setUpdateCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [size, setSize] = useState(0)
  const [newPixels, setNewPixels] = useState<Pixel[]>([])
  const [updatedPixels, setUpdatedPixels] = useState<Pixel[]>([])
  const [selectedPixel, setSelectedPixel] = useState<Pixel>()
  const [currentBlock, setCurrentBlock] = useState<number>(block)
  const { getPixels, loading } = useGetPixels()
  const [tool, setTool] = useState("move")
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [transformDisabled, setTransformDisabled] = useState(false)
  const [color, setColor] = useState("#FF4500")
  const [drawingPixels, setDrawingPixels] = useState(false)
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const signer = useSigner()
  const toast = useToast()

  const { data, isLoading, error } = useContractEvents(
    contract,
    "PixelChanged",
    {
      queryFilter: {
        order: "desc",
        fromBlock: currentBlock,
        toBlock: currentBlock + 100000,
      },
      subscribe: true,
    },
  )

  // load grid image and set size
  useEffect(() => {
    if (!isMobile) onOpen()
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
      if (canvasRef.current && updateCanvasRef.current && size > 0) {
        let _canvas = canvasRef.current.getContext("2d")
        _canvas.shadowBlur = 0
        setCanvas(_canvas)
        setUpdateCanvas(updateCanvasRef.current.getContext("2d"))
        centerCanvas()
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

  function updatePixel(x, y) {
    if (!signer) {
      // open modal
    }
    let index = updatedPixels.findIndex(
      (pixel) => pixel.x === x && pixel.y === y,
    )
    // if pixel already being updated, update the color
    if (index !== -1) {
      let _updatedPixels = updatedPixels
      _updatedPixels[index].color = color
      setUpdatedPixels([..._updatedPixels])
      updateCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      updateCanvas.fillStyle = color
      updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      return
    }
    if (updatedPixels.length == maxSpaces) {
      return // TODO: SHOW A TOAST?
    }
    updateCanvas.fillStyle = color
    updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    setUpdatedPixels([...updatedPixels, { x, y, color }])
  }

  function confirmClaimPixels() {
    toast({
      title: `Pixels Claimed!`,
      description: `You have successfully claimed ${updatedPixels.length} pixels!`,
      status: "success",
      isClosable: true,
    })
    setUpdatedPixels([])
  }

  function removeUpdatedPixel(x: number, y: number) {
    updateCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)

    let index = updatedPixels.findIndex(
      (pixel) => pixel.x === x && pixel.y === y,
    )
    if (!updateCanvas || index == -1) {
      return
    }
    setUpdatedPixels([
      ...updatedPixels.filter((pixel) => !(pixel.x === x && pixel.y === y)),
    ])
  }

  function clearUpdatedPixels() {
    if (!updateCanvas) return
    setUpdatedPixels([])
    updateCanvas.clearRect(0, 0, size, size)
  }

  function selectPixel(x, y) {
    if (!isOpen) onOpen()
    setSelectedPixel({ x, y })
  }

  function clickPixel(event) {
    if (!updateCanvas || !transformComponentRef.current) {
      return
    }
    setShowColorPicker(false)
    const bounding = updateCanvas.canvas.getBoundingClientRect()
    let scale = transformComponentRef.current.instance.transformState.scale
    const x = Math.floor((event.clientX - bounding.left) / scale / pixelSize)
    const y = Math.floor((event.clientY - bounding.top) / scale / pixelSize)

    if (tool === "select") {
      selectPixel(x, y)
    } else if (tool === "update") {
      updatePixel(x, y)
    } else if (tool === "remove") {
      removeUpdatedPixel(x, y)
    }
  }

  function drawPixels(event) {
    if (!drawingPixels) return
    const bounding = updateCanvas.canvas.getBoundingClientRect()
    let scale = transformComponentRef.current.instance.transformState.scale
    let x
    let y
    if (event.touches) {
      x = Math.floor(
        (event.touches[0].clientX - bounding.left) / scale / pixelSize,
      )
      y = Math.floor(
        (event.touches[0].clientY - bounding.top) / scale / pixelSize,
      )
    } else {
      x = Math.floor((event.clientX - bounding.left) / scale / pixelSize)
      y = Math.floor((event.clientY - bounding.top) / scale / pixelSize)
    }
    if (tool === "update") {
      updatePixel(x, y)
    } else if (tool === "remove") {
      removeUpdatedPixel(x, y)
    }
  }

  function enableDrawPixels(event) {
    if (tool == "move") return
    setDrawingPixels(true)
  }

  function disableDrawPixels(event) {
    if (tool == "move") return
    setDrawingPixels(false)
  }

  function toggleColorPicker() {
    setShowColorPicker(!showColorPicker)
  }

  function centerCanvas() {
    if (transformComponentRef.current) {
      let prevTransformDisabled = transformDisabled
      setTransformDisabled(false)
      const { setTransform } = transformComponentRef.current
      let scale = 15
      setTimeout(() => {
        let offset = 500
        if (isMobile) offset = -100
        setTransform(
          (((size - pixelSize * scale) * -1) / 2) * scale + offset,
          (((size - pixelSize * scale) * -1) / 2) * scale,
          scale,
        )
        setTransformDisabled(prevTransformDisabled)
      }, 100)
    }
  }

  let controls = (
    <HStack
      mt="1em"
      pos="absolute"
      left={isOpen ? "21em" : "1em"}
      top={isOpen ? "initial" : "88px"}
      alignItems="flex-start"
      gap="1em"
    >
      <Stack>
        <Tooltip label="Close Menu" placement="right">
          <IconButton
            aria-label="close"
            icon={<Icon as={GiHamburgerMenu} />}
            onClick={
              isOpen
                ? () => {
                    setSelectedPixel(undefined)
                    onClose()
                  }
                : () => {
                    onOpen()
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
              centerCanvas()
              setShowColorPicker(false)
            }}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
          />
        </Tooltip>
        <Tooltip label="View Pixel" placement="right">
          <IconButton
            aria-label="select"
            icon={<Icon as={LiaHandPointer} />}
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
            bgColor={tool === "update" ? "#FF4500" : ""}
            color={tool === "update" ? "white" : ""}
            onClick={() => {
              setTool("update")
              setShowColorPicker(false)
            }}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
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
        {!isOpen && updatedPixels.length > 0 && (
          <Tooltip label="Save Updates" placement="right">
            <IconButton
              aria-label="save"
              icon={<Icon as={BiSave} />}
              onClick={onOpen}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
            />
          </Tooltip>
        )}
      </Stack>
      {(tool == "update" || tool == "remove") && showColorPicker && (
        <Stack>
          <HexColorPicker color={color} onChange={setColor} />
          <Editable value={color}>
            <EditablePreview />
            <EditableInput onChange={(e) => setColor(e.target.value)} />
          </Editable>
        </Stack>
      )}
    </HStack>
  )

  return (
    <Stack overflowY={"hidden"}>
      <Stack overflow={"hidden"} maxH={"calc(100vh - 88px)"} mt="88px">
        <TransformWrapper
          ref={transformComponentRef}
          limitToBounds={false}
          minScale={0.1}
          maxScale={20}
          doubleClick={{ disabled: true }}
          centerOnInit={true}
          panning={{ velocityDisabled: true }}
          wheel={{ step: 0.001, smoothStep: 0.005 }}
          disabled={transformDisabled}
        >
          <TransformComponent>
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
              ref={updateCanvasRef}
              width={size}
              height={size}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                imageRendering: "pixelated",
                cursor: tool === "move" ? "pointer" : "crosshair",
                position: "relative",
                zIndex: 100000,
              }}
              onClick={clickPixel}
              onMouseMoveCapture={drawPixels}
              onTouchMoveCapture={drawPixels}
              onMouseDown={enableDrawPixels}
              onTouchStart={enableDrawPixels}
              onMouseLeave={disableDrawPixels}
              onMouseUp={disableDrawPixels}
              onTouchEnd={disableDrawPixels}
              onTouchCancel={disableDrawPixels}
            />
          </TransformComponent>
        </TransformWrapper>
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
      {!isOpen && controls}
      <Drawer
        placement={"left"}
        onClose={onClose}
        isOpen={isOpen}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay display="none" />
        <DrawerContent containerProps={{ width: "0" }}>
          <DrawerBody bgColor="#FF4500" mt="5.5em" p="1em" pt="0 !important">
            <Stack
              w="100%"
              bgColor="transparent"
              h="100%"
              justifyContent={"space-between"}
            >
              {controls}
              <ManagePixels
                confirmClaimPixels={confirmClaimPixels}
                removePixel={removeUpdatedPixel}
                clearUpdatedPixels={clearUpdatedPixels}
                updatedPixels={updatedPixels}
                maxSpaces={maxSpaces}
              />
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
    </Stack>
  )
}
