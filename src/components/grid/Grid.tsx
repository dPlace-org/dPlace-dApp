import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Stack,
  useDisclosure,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react"
import { MutableRefObject, useEffect, useRef, useState } from "react"

import { useSigner } from "@thirdweb-dev/react"
import {
  getMatrixTransformStyles,
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch"
import { useDebouncedCallback } from "use-debounce"
import SelectedPixel from "./SelectedPixel"
interface GridProps {
  tool: string
  hasStencil: boolean
  drawingCanvasRef: MutableRefObject<HTMLCanvasElement>
  updateCanvasRef: MutableRefObject<HTMLCanvasElement>
  stencilCanvasRef: MutableRefObject<HTMLCanvasElement>
  transformComponentRef: MutableRefObject<ReactZoomPanPinchRef>
  pixelSize: number
  updatedPixels: Pixel[]
  maxPixels: number
  gridSize: number
  hideStencil: boolean
  selectedColor: string
  selectedPixel: Pixel
  setSelectedColor: (val: string) => void
  saveUpdatePixels: (pixels: Pixel[]) => void
  setSelectedPixel: (pixel: Pixel) => void
  centerCanvasOnPixel: (pixel: Pixel, scale: number) => void
  removeUpdatedPixel: (x: number, y: number) => void
  setShowColorPicker: (val: boolean) => void
  setTool: (tool: string) => void
}

export default function Grid({
  tool,
  hasStencil,
  drawingCanvasRef,
  updateCanvasRef,
  stencilCanvasRef,
  transformComponentRef,
  pixelSize,
  maxPixels,
  gridSize,
  updatedPixels,
  hideStencil,
  selectedColor,
  selectedPixel,
  setSelectedColor,
  centerCanvasOnPixel,
  saveUpdatePixels,
  setSelectedPixel,
  removeUpdatedPixel,
  setShowColorPicker,
  setTool,
}: GridProps) {
  const id = "paint-error"
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null)
  const [initialized, setInitialized] = useState(false)
  const [highlightedPixel, setHighlightedPixel] = useState<Pixel>()
  const signer = useSigner()
  const [drawingPixels, setDrawingPixels] = useState(false)
  const [updateCanvas, setUpdateCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [highlightCanvas, setHighlightCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [drawingCanvas, setDrawingCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const toast = useToast()

  const {
    isOpen: isPixelInfoOpen,
    onOpen: onPixelInfoOpen,
    onClose: onPixelInfoClose,
  } = useDisclosure()

  let debounceToast = useDebouncedCallback(async (options: UseToastOptions) => {
    if (!toast.isActive(id)) {
      toast(options)
    }
  }, 100)

  // center canvas on center pixels
  useEffect(() => {
    if (initialized) {
      if (!hasStencil) {
        centerCanvasOnPixel({ x: 500, y: 500 }, 1)
      }
    }
  }, [initialized])

  useEffect(() => {
    if (
      drawingCanvasRef.current &&
      updateCanvasRef.current &&
      highlightCanvasRef.current &&
      stencilCanvasRef.current
    ) {
      setUpdateCanvas(updateCanvasRef.current.getContext("2d"))
      setHighlightCanvas(highlightCanvasRef.current.getContext("2d"))
      setDrawingCanvas(drawingCanvasRef.current.getContext("2d"))
    }
  }, [drawingCanvasRef, updateCanvasRef, highlightCanvasRef, stencilCanvasRef])

  function getPixelFromCoordinates(xCord: number, yCord: number) {
    if (!updateCanvas || !transformComponentRef.current) return { x: 0, y: 0 }
    const bounding = updateCanvas.canvas.getBoundingClientRect()
    let scale = transformComponentRef.current.instance.transformState.scale
    const x = Math.floor((xCord - bounding.left) / scale / pixelSize)
    const y = Math.floor((yCord - bounding.top) / scale / pixelSize)
    return { x, y }
  }

  // user called to draw pixels
  function drawPixel(x, y, color) {
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
      saveUpdatePixels(_updatedPixels)
      drawingCanvas.clearRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize,
      )
      drawingCanvas.fillStyle = color
      drawingCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      return
    }
    if (updatedPixels.length == maxPixels) {
      debounceToast({
        status: "warning",
        description:
          "You have reached the maximum number of pixels to update per transaction.",
        position: "top-right",
        containerStyle: {
          marginTop: "120px",
        },
        id,
      })
      return
    }
    drawingCanvas.fillStyle = color
    drawingCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    saveUpdatePixels([...updatedPixels, { x, y, color: color }])
  }

  // open pixel menu and set selected pixel
  function selectPixel(x, y) {
    onPixelInfoOpen()
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
    } else if (tool === "paint") {
      drawPixel(x, y, selectedColor)
    } else if (tool === "remove") {
      removeUpdatedPixel(x, y)
    }
  }

  function drawPixels(event) {
    if (!drawingCanvas) return
    let { x, y } = event.touches
      ? getPixelFromCoordinates(
          event.touches[0].clientX,
          event.touches[0].clientY,
        )
      : getPixelFromCoordinates(event.clientX, event.clientY)

    if (!drawingPixels) {
      setTimeout(() => highlightPixel({ x, y }), 10)
      return
    }
    if (tool === "paint") {
      drawPixel(x, y, selectedColor)
    } else if (tool === "remove") {
      removeUpdatedPixel(x, y)
    }
  }

  function highlightPixel(pixel: Pixel) {
    if (!highlightCanvas) return
    let { x, y } = pixel
    if (highlightedPixel?.x === x && highlightedPixel?.y === y) return
    if (highlightedPixel) {
      highlightCanvas.clearRect(0, 0, gridSize, gridSize)
    }
    highlightCanvas.fillStyle =
      tool == "paint" ? selectedColor : "rgba(0, 0, 0, 0.2)"
    highlightCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    setHighlightedPixel({ x, y })
  }

  function unHighlightPixel() {
    if (highlightedPixel) {
      highlightCanvas.clearRect(0, 0, gridSize, gridSize)
    }
    setHighlightedPixel(undefined)
  }

  function enableDrawPixels(event) {
    setShowColorPicker(false)
    if (tool == "remove") unHighlightPixel()
    if (tool == "move") return
    setDrawingPixels(true)
  }

  function disableDrawPixels(event) {
    unHighlightPixel()
    if (tool == "move") return
    setDrawingPixels(false)
  }

  function handleSelectedClose() {
    setTool("move")
    onPixelInfoClose()
  }

  return (
    <>
      <Stack w="100%" maxH={"calc(100dvh - 88px)"} mt="88px">
        <TransformWrapper
          ref={transformComponentRef}
          limitToBounds={false}
          initialScale={0.5}
          minScale={0.1}
          maxScale={20}
          doubleClick={{ disabled: true }}
          centerOnInit={true}
          panning={{ velocityDisabled: true, disabled: tool !== "move" }}
          wheel={{ step: 0.001, smoothStep: 0.005 }}
          customTransform={getMatrixTransformStyles}
          onZoomStart={() => {
            setTool("move")
          }}
        >
          <TransformComponent wrapperStyle={{ width: "100%" }}>
            <canvas
              ref={updateCanvasRef}
              width={gridSize}
              height={gridSize}
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                imageRendering: "pixelated",
                cursor: tool === "move" ? "pointer" : "crosshair",
                position: "absolute",
                backgroundColor: "white",
              }}
            />
            <canvas
              ref={stencilCanvasRef}
              width={gridSize}
              height={gridSize}
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                imageRendering: "pixelated",
                cursor: tool === "move" ? "pointer" : "crosshair",
                position: "absolute",
                display: hideStencil ? "none" : "",
                opacity: 0.85,
                filter: "drop-shadow(black 1px 0px 2px)",
              }}
            />
            <canvas
              ref={drawingCanvasRef}
              width={gridSize}
              height={gridSize}
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                imageRendering: "pixelated",
                cursor: tool === "move" ? "pointer" : "crosshair",
                position: "absolute",
              }}
            />
            <canvas
              ref={highlightCanvasRef}
              width={gridSize}
              height={gridSize}
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
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                imageRendering: "pixelated",
                cursor: tool === "move" ? "pointer" : "crosshair",
                position: "relative",
              }}
              id="grid"
            />
          </TransformComponent>
        </TransformWrapper>
      </Stack>
      <Modal
        isOpen={isPixelInfoOpen}
        onClose={handleSelectedClose}
        size="xs"
        isCentered
      >
        {/* <ModalOverlay /> */}
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p="0">
            <SelectedPixel
              setSelectedColor={setSelectedColor}
              pixel={selectedPixel}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export interface Pixel {
  x: number
  y: number
  color?: string
  price?: number
  owner?: string
  lastUpdated?: number
}
