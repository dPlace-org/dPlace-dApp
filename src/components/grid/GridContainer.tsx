import {
  Stack,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { useContract, useContractEvents, useSigner } from "@thirdweb-dev/react"

import { ethers } from "ethers"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { useInterval, useLocalStorage } from "react-use"
import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import { DPlaceGrid__factory } from "types"
import { useGetPixels } from "../../utils/Subgraph"
import Grid, { Pixel } from "./Grid"
import GridControls from "./GridControls"
import StencilManager from "./StencilManager"

export default function GridContainer() {
  let gridAddress = process.env.NEXT_PUBLIC_GRID_ADDRESS
  const maxPixels = 200
  const pixelSize = 2
  const gridSize = 2000
  const [block, setBlock] = useState<number>(0)
  const [selectedColor, setSelectedColor] = useState("#FF4500")
  const [tool, setTool] = useState("move")
  const [currentBlock, setCurrentBlock] = useState<number>(block)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const signer = useSigner()
  const [newPixels, setNewPixels] = useState<Pixel[]>([])
  const [selectedPixel, setSelectedPixel] = useState<Pixel>()
  const [panningDisabled, setPanningDisabled] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [shouldUpdate, setShouldUpdate] = useState(false)
  const [cachedGridUrl, setCachedGridUrl] = useState("")
  const [hideStencil, setHideStencil] = useState(false)
  const [storagePixels, saveStoragePixels] = useLocalStorage("pixels", [])
  const [_loading, setLoading] = useState(false)
  const [updatedPixels, setUpdatedPixels] = useState<Pixel[]>([])
  const [currentStencil, setCurrentStencil] = useState(null)
  const toast = useToast()
  const { getPixels, loading: subgraphPixelsLoading } = useGetPixels()
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const updateCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const stencilCanvasRef = useRef<HTMLCanvasElement>(null)
  const [drawingCanvas, setDrawingCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [stencilCanvas, setStencilCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const [updateCanvas, setUpdateCanvas] =
    useState<CanvasRenderingContext2D | null>(null)
  const router = useRouter()
  const { contract } = useContract(gridAddress, DPlaceGrid__factory.abi)

  const { data: chainEventPixels } = useContractEvents(
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

  const loading = subgraphPixelsLoading || _loading
  let hasStencil = currentStencil != undefined

  const {
    isOpen: isStencilOpen,
    onOpen: onStencilOpen,
    onClose: onStencilClose,
  } = useDisclosure()

  useInterval(() => {
    setShouldUpdate(true)
  }, 1000000)

  useEffect(() => {
    const handler = async () => {
      try {
        setLoading(true)
        let response = await fetch("/api/retrieve-grid")
        let url = await response.json()
        if (!url.message) setCachedGridUrl("/assets/images/grid-0.png")
        setCachedGridUrl(url.message)
        setLoading(false)
      } catch (e) {
        console.log(e)
        setCachedGridUrl("/assets/images/grid-0.png")
      }
    }
    handler()
  }, [])

  useEffect(() => {
    if (
      drawingCanvasRef.current &&
      updateCanvasRef.current &&
      stencilCanvasRef.current
    ) {
      let _canvas = drawingCanvasRef.current.getContext("2d")
      _canvas.shadowBlur = 0
      setDrawingCanvas(_canvas)
      setUpdateCanvas(updateCanvasRef.current.getContext("2d"))
      setStencilCanvas(stencilCanvasRef.current.getContext("2d"))
    }
  }, [drawingCanvasRef, updateCanvasRef, stencilCanvasRef])

  useEffect(() => {
    if (signer && signer.provider) {
      let provider = signer.provider
      provider.getBlockNumber().then((block) => setBlock(block))
    }
  }, [signer])

  useEffect(() => {
    if (tool !== "select") {
      setSelectedPixel(undefined)
    }
    if (tool == "move") {
      setPanningDisabled(false)
    } else {
      setPanningDisabled(true)
    }
  }, [tool])

  // draw pixels from storage
  useEffect(() => {
    if (storagePixels && saveStoragePixels && drawingCanvas) {
      setUpdatedPixels(storagePixels)
      for (let i = 0; i < storagePixels.length; i++) {
        let pixel = storagePixels[i]
        setTimeout(() => {
          drawingCanvas.fillStyle = pixel.color
          drawingCanvas.fillRect(
            pixel.x * pixelSize,
            pixel.y * pixelSize,
            pixelSize,
            pixelSize,
          )
        }, 10)
      }
    }
  }, [saveStoragePixels, drawingCanvas])

  // draw pixels from subgraph
  useEffect(() => {
    if (!cachedGridUrl) return
    var gridImage = new Image()
    gridImage.src = cachedGridUrl
    gridImage.onload = async () => {
      if (storagePixels.length > 0) {
        centerCanvasOnPixel(storagePixels[0], 4)
        setTool("paint")
      } else if (!currentStencil) {
        centerCanvasOnPixel({ x: 500, y: 500 }, 1)
      }
      updateCanvas.imageSmoothingEnabled = false
      updateCanvas.drawImage(gridImage, 0, 0, gridSize, gridSize)
      await updateCanvasFromSubgraph()
    }
  }, [cachedGridUrl, updateCanvas])

  useEffect(() => {
    let handler = async () => {
      await updateCanvasFromSubgraph()
      setShouldUpdate(false)
    }
    if (shouldUpdate) handler()
  }, [shouldUpdate])

  // draw pixels from chain events
  useEffect(() => {
    if (chainEventPixels) {
      for (let i = 0; i < chainEventPixels.length; i++) {
        let x = Number(chainEventPixels[i].data.x)
        let y = Number(chainEventPixels[i].data.y)
        let color = ethers.utils.parseBytes32String(
          chainEventPixels[i].data.data,
        )
        setTimeout(() => addNewPixel({ x, y, color }), 1)
      }
    }
  }, [chainEventPixels])

  let updateCanvasFromSubgraph = async () => {
    if (updateCanvas) {
      // Catch up grid from subgraph
      let timestamp = getTimestampFromUrl(cachedGridUrl)
      let pixels = await getPixels(timestamp)
      setNewPixels(pixels)
      for (let i = 0; i < pixels.length; i++) {
        setTimeout(() => addNewPixel(pixels[i]), 1)
      }
    }
  }

  // manual pixel addition from catchup functions
  function addNewPixel(pixel: Pixel) {
    if (!updateCanvas) return

    let newPixelIndex = newPixels.findIndex(
      (_pixel) => _pixel.x === pixel.x && _pixel.y === pixel.y,
    )
    if (newPixels[newPixelIndex]?.color === pixel.color) {
      return
    }
    let x = pixel.x
    let y = pixel.y
    let color = pixel.color
    // draw pixel on updateCanvas

    if (color) {
      updateCanvas.fillStyle = color
      updateCanvas.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
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

  function confirmClaimPixels() {
    toast({
      title: `Pixels Claimed!`,
      description: `You have successfully claimed ${updatedPixels.length} pixels!`,
      status: "success",
      isClosable: true,
      position: "top-right",
      containerStyle: {
        marginTop: "120px",
      },
    })
    saveUpdatePixels([])
  }

  function toggleStencil() {
    setShowColorPicker(false)
    if (isStencilOpen) {
      onStencilClose()
    } else {
      onStencilOpen()
    }
  }

  function toggleShowStencil() {
    setShowColorPicker(false)
    setHideStencil(!hideStencil)
  }

  function saveUpdatePixels(pixels: Pixel[]) {
    setUpdatedPixels([...pixels])
    saveStoragePixels([...pixels])
  }

  function clearDrawnPixels() {
    if (!drawingCanvas) return
    setShowColorPicker(false)
    saveUpdatePixels([])
    drawingCanvas.clearRect(0, 0, gridSize, gridSize)
  }

  function centerCanvasOnPixel(pixel: Pixel, scale: number) {
    if (transformComponentRef.current) {
      setShowColorPicker(false)
      let prevPanningDisabled = panningDisabled
      setPanningDisabled(false)
      const { setTransform } = transformComponentRef.current
      setTimeout(() => {
        const { innerWidth: width, innerHeight: height } = window
        let headerOffset = 100
        let xTrans = pixel.x * scale * pixelSize * -1 + width / 2
        let yTrans =
          pixel.y * scale * pixelSize * -1 + (height / 2 - headerOffset)
        setTransform(xTrans, yTrans, scale)
        setPanningDisabled(prevPanningDisabled)
      }, 100)
    }
  }

  function removeUpdatedPixel(x: number, y: number) {
    drawingCanvas.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)

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

  return (
    <Stack overflowY="hidden">
      <Grid
        tool={tool}
        hasStencil={hasStencil}
        drawingCanvasRef={drawingCanvasRef}
        updateCanvasRef={updateCanvasRef}
        stencilCanvasRef={stencilCanvasRef}
        transformComponentRef={transformComponentRef}
        pixelSize={pixelSize}
        updatedPixels={updatedPixels}
        maxPixels={maxPixels}
        gridSize={gridSize}
        loading={loading}
        setTool={setTool}
        hideStencil={hideStencil}
        selectedColor={selectedColor}
        selectedPixel={selectedPixel}
        setSelectedColor={setSelectedColor}
        saveUpdatePixels={saveUpdatePixels}
        setSelectedPixel={setSelectedPixel}
        centerCanvasOnPixel={centerCanvasOnPixel}
        removeUpdatedPixel={removeUpdatedPixel}
        setShowColorPicker={setShowColorPicker}
      />
      <GridControls
        tool={tool}
        setTool={setTool}
        updatedPixels={updatedPixels}
        hasStencil={hasStencil}
        showingStencil={!hideStencil}
        showColorPicker={showColorPicker}
        selectedColor={selectedColor}
        loading={loading}
        centerCanvasOnPixel={centerCanvasOnPixel}
        setSelectedColor={setSelectedColor}
        clearDrawnPixels={clearDrawnPixels}
        setShowColorPicker={setShowColorPicker}
        toggleStencil={toggleStencil}
        toggleShowStencil={toggleShowStencil}
        setLoading={setLoading}
        confirmClaimPixels={confirmClaimPixels}
      />
      <StencilManager
        pixelSize={pixelSize}
        isOpen={isStencilOpen}
        onClose={onStencilClose}
        centerOn={centerCanvasOnPixel}
        stencilCanvas={stencilCanvas}
        currentStencil={currentStencil}
        setCurrentStencil={setCurrentStencil}
      />
    </Stack>
  )
}

function getTimestampFromUrl(url: string): number {
  let splitUrl = url.split("/")
  let timestamp = splitUrl[splitUrl.length - 1].split(".")[0].split("-")[0]
  return Number(timestamp)
}
