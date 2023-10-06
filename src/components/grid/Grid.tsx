import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { BsArrowsMove } from "react-icons/bs"
import { LuPaintbrush2 } from "react-icons/lu"
import { PiCrosshairBold, PiEraserBold } from "react-icons/pi"
import { useGetPlaces } from "../../utils/Subgraph"
import ManagePlaces from "./ManagePlaces"
import SelectedPlace from "./SelectedPlace"

import { useContract, useContractEvents, useSigner } from "@thirdweb-dev/react"
import { ethers } from "ethers"
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"
import { DPlaceGrid__factory } from "types"

export interface Place {
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
  const [newPlaces, setNewPlaces] = useState<Place[]>([])
  const [updatedPlaces, setUpdatedPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place>()
  const [currentBlock, setCurrentBlock] = useState<number>(block)
  const { getPlaces } = useGetPlaces()
  const [tool, setTool] = useState("select")
  const [color, setColor] = useState("#FF4500")
  // const [panning, setPanning] = useState(false)
  const [drawingPlaces, setDrawingPlaces] = useState(false)
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)
  const signer = useSigner()
  const toast = useToast()

  const { data, isLoading, error } = useContractEvents(
    contract,
    "PlaceChanged",
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
    onOpen()
  }, [])

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
        let places = await getPlaces(Number(timestamp))
        setNewPlaces(places)
        for (let i = 0; i < places.length; i++) {
          setTimeout(() => addNewPlace(places[i]), 1)
        }

        // initializeNewPlaces(places)
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
        setTimeout(() => addNewPlace({ x, y, color }), 1)
      }
    }
    let handler = async () => {
      let block = await signer.provider.getBlockNumber()
      setCurrentBlock(block)
    }
    if (signer) handler()
  }, [data])

  function addNewPlace(place: Place) {
    if (!canvas) return

    let newPlaceIndex = newPlaces.findIndex(
      (_place) => _place.x === place.x && _place.y === place.y,
    )
    if (newPlaces[newPlaceIndex]?.color === place.color) {
      return
    }
    let x = place.x
    let y = place.y
    let color = place.color
    // draw place on canvas

    if (color) {
      canvas.fillStyle = color
      canvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }

    if (newPlaceIndex !== -1) {
      let _newPlaces = newPlaces
      _newPlaces[newPlaceIndex].color = place.color
      setNewPlaces([..._newPlaces])
    } else {
      let _newPlaces = newPlaces
      setNewPlaces([..._newPlaces, place])
    }
  }

  function updatePlace(x, y) {
    if (!signer) {
      // open modal
    }
    let index = updatedPlaces.findIndex(
      (place) => place.x === x && place.y === y,
    )
    // if place already being updated, update the color
    if (index !== -1) {
      let _updatedPlaces = updatedPlaces
      _updatedPlaces[index].color = color
      setUpdatedPlaces([..._updatedPlaces])
      updateCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      updateCanvas.fillStyle = color
      updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      return
    }
    if (updatedPlaces.length == maxSpaces) {
      return // TODO: SHOW A TOAST?
    }
    updateCanvas.fillStyle = color
    updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    setUpdatedPlaces([...updatedPlaces, { x, y, color }])
  }

  function confirmClaimPlaces() {
    toast({
      title: `Places Claimed!`,
      description: `You have successfully claimed ${updatedPlaces.length} places!`,
      status: "success",
      isClosable: true,
    })
    setUpdatedPlaces([])
  }

  function removeUpdatedPlace(x: number, y: number) {
    updateCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)

    let index = updatedPlaces.findIndex(
      (place) => place.x === x && place.y === y,
    )
    if (!updateCanvas || index == -1) {
      return
    }
    setUpdatedPlaces([
      ...updatedPlaces.filter((place) => !(place.x === x && place.y === y)),
    ])
  }

  function clearUpdatedPlaces() {
    if (!updateCanvas) return
    setUpdatedPlaces([])
    updateCanvas.clearRect(0, 0, size, size)
  }

  function selectPlace(x, y) {
    setSelectedPlace({ x, y })
  }

  function clickPlace(event) {
    if (!updateCanvas || !transformComponentRef.current) {
      return
    }
    const bounding = updateCanvas.canvas.getBoundingClientRect()
    let scale = transformComponentRef.current.instance.transformState.scale
    const x = Math.floor((event.clientX - bounding.left) / scale / pixelSize)
    const y = Math.floor((event.clientY - bounding.top) / scale / pixelSize)

    if (tool === "select") {
      selectPlace(x, y)
    } else if (tool === "update") {
      updatePlace(x, y)
    } else if (tool === "remove") {
      removeUpdatedPlace(x, y)
    }
  }

  function drawPlaces(event) {
    if (!drawingPlaces) return
    const bounding = updateCanvas.canvas.getBoundingClientRect()
    let scale = transformComponentRef.current.instance.transformState.scale
    const x = Math.floor((event.clientX - bounding.left) / scale / pixelSize)
    const y = Math.floor((event.clientY - bounding.top) / scale / pixelSize)
    if (tool === "update") {
      updatePlace(x, y)
    } else if (tool === "remove") {
      removeUpdatedPlace(x, y)
    }
    // console.log(x, y)
  }

  function enableDrawPlaces(event) {
    if (tool == "select") return
    setDrawingPlaces(true)
  }

  function disableDrawPlaces(event) {
    if (tool == "select") return
    setDrawingPlaces(false)
  }

  function centerCanvas() {
    if (transformComponentRef.current) {
      const { zoomToElement, setTransform, resetTransform, centerView } =
        transformComponentRef.current
      let scale = 15
      setTransform(
        (((size - pixelSize * scale) * -1) / 2) * scale + 500,
        (((size - pixelSize * scale) * -1) / 2) * scale,
        scale,
      )
    }
  }

  return (
    <Stack>
      <div>
        <TransformWrapper
          ref={transformComponentRef}
          limitToBounds={false}
          minScale={0.1}
          maxScale={20}
          doubleClick={{ disabled: true }}
          centerOnInit={true}
          panning={{ velocityDisabled: true }}
          wheel={{ step: 0.001, smoothStep: 0.005 }}
          disabled={tool === "update" || tool === "remove"}
          // onPanning={() => setPanning(true)}
          // onPanningStop={() => setTimeout(() => setPanning(false), 1)}
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
                cursor: tool === "select" ? "pointer" : "crosshair",
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
                cursor: tool === "select" ? "pointer" : "crosshair",
                position: "relative",
                zIndex: 100000,
              }}
              onClick={clickPlace}
              onMouseMoveCapture={drawPlaces}
              onTouchMoveCapture={drawPlaces}
              onMouseDown={enableDrawPlaces}
              onTouchStart={enableDrawPlaces}
              onMouseLeave={disableDrawPlaces}
              onMouseUp={disableDrawPlaces}
              onTouchEnd={disableDrawPlaces}
              onTouchCancel={disableDrawPlaces}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
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
              <HStack
                mt="1em"
                pos="absolute"
                left="21em"
                alignItems="flex-start"
                gap="1em"
              >
                <Stack>
                  <IconButton
                    aria-label="center"
                    icon={<Icon as={PiCrosshairBold} />}
                    onClick={centerCanvas}
                    _hover={{ backgroundColor: "#FF4500", color: "white" }}
                  />
                  <IconButton
                    aria-label="select"
                    icon={<Icon as={BsArrowsMove} />}
                    bgColor={tool === "select" ? "#FF4500" : ""}
                    color={tool === "select" ? "white" : ""}
                    onClick={() => setTool("select")}
                    _hover={{ backgroundColor: "#FF4500", color: "white" }}
                  />
                  <IconButton
                    aria-label="update"
                    icon={<Icon as={LuPaintbrush2} />}
                    bgColor={tool === "update" ? color : ""}
                    color={tool === "update" ? "white" : ""}
                    onClick={() => setTool("update")}
                    _hover={{ backgroundColor: "#FF4500", color: "white" }}
                  />
                  <IconButton
                    aria-label="remove"
                    icon={<Icon as={PiEraserBold} />}
                    bgColor={tool === "remove" ? "#FF4500" : ""}
                    color={tool === "remove" ? "white" : ""}
                    onClick={() => setTool("remove")}
                    _hover={{ backgroundColor: "#FF4500", color: "white" }}
                  />
                </Stack>
                {tool === "update" && (
                  <Stack>
                    <HexColorPicker color={color} onChange={setColor} />
                    <Text>{color}</Text>
                  </Stack>
                )}
              </HStack>
              <SelectedPlace place={selectedPlace} setUpdateColor={setColor} />
              <ManagePlaces
                confirmClaimPlaces={confirmClaimPlaces}
                removePlace={removeUpdatedPlace}
                clearUpdatedPlaces={clearUpdatedPlaces}
                updatedPlaces={updatedPlaces}
                maxSpaces={maxSpaces}
              />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Stack>
  )
}
