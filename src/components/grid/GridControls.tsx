import { getColorOrDefault, getTextForColor } from "@/utils/utils"
import {
  Editable,
  EditableInput,
  EditablePreview,
  HStack,
  Icon,
  IconButton,
  Stack,
  Tooltip,
} from "@chakra-ui/react"
import { useCallback } from "react"
import { HexColorPicker } from "react-colorful"
import { BiSave } from "react-icons/bi"
import { BsArrowsMove } from "react-icons/bs"
import { FaEyeDropper, FaPalette, FaRegImages } from "react-icons/fa"
import { GiHamburgerMenu } from "react-icons/gi"
import { ImBin } from "react-icons/im"
import { LuImageOff, LuImagePlus, LuPaintbrush2 } from "react-icons/lu"
import {
  PiCrosshairBold,
  PiEraserBold,
  PiMagnifyingGlassBold,
} from "react-icons/pi"
import useEyeDropper from "use-eye-dropper"
import { Pixel } from "./Grid"

interface Props {
  tool: string
  setTool: (tool: string) => void
  hasUpdatedPixels: boolean
  hasStencil: boolean
  showingStencil: boolean
  showColorPicker: boolean
  isPixelsMenuOpen: boolean
  selectedColor: string
  togglePixelMenu: () => void
  centerCanvasOnPixel: (pixel: Pixel, scale: number) => void
  setSelectedColor: (color: string) => void
  clearUpdatedPixels(): void
  setShowColorPicker(val: boolean): void
  toggleStencil(): void
  toggleShowStencil(): void
}

export default function GridControls({
  tool,
  isPixelsMenuOpen,
  hasUpdatedPixels,
  selectedColor,
  hasStencil,
  showingStencil,
  showColorPicker,
  setTool,
  setSelectedColor,
  togglePixelMenu,
  centerCanvasOnPixel,
  clearUpdatedPixels,
  setShowColorPicker,
  toggleStencil,
  toggleShowStencil,
}: Props) {
  const { open } = useEyeDropper()

  const pickColor = useCallback(() => {
    // Using async/await (can be used as a promise as-well)
    const openPicker = async () => {
      try {
        const color = await open()
        setSelectedColor(color.sRGBHex)
        setTool("update")
      } catch (e) {
        console.log(e)
        // Ensures component is still mounted
      }
    }
    openPicker()
  }, [open])

  return (
    <HStack
      pos="absolute"
      left={isPixelsMenuOpen ? "21em" : "1em"}
      top={"108px"}
      alignItems="flex-start"
      gap="1em"
    >
      <Stack>
        <Tooltip label="Close Menu" placement="right">
          <IconButton
            aria-label="close"
            icon={<Icon as={GiHamburgerMenu} />}
            onClick={() => togglePixelMenu()}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
          />
        </Tooltip>
        <Tooltip label="Center Grid" placement="right">
          <IconButton
            aria-label="center"
            icon={<Icon as={PiCrosshairBold} />}
            onClick={() => {
              centerCanvasOnPixel({ x: 500, y: 500 }, 5)
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
            bgColor={tool === "update" ? selectedColor : ""}
            color={tool === "update" ? getTextForColor(selectedColor) : ""}
            onClick={() => {
              setTool("update")
              setShowColorPicker(false)
            }}
            _hover={{
              backgroundColor: selectedColor,
              color: getTextForColor(selectedColor),
            }}
          />
        </Tooltip>
        {(tool == "update" || tool == "remove") && (
          <>
            <Tooltip label="Toggle Color Picker" placement="right">
              <IconButton
                aria-label="show-color-picker"
                icon={<Icon as={FaPalette} />}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
            </Tooltip>
            <Tooltip label="Color extractor" placement="right">
              <IconButton
                aria-label="show-color-picker"
                icon={<Icon as={FaEyeDropper} />}
                onClick={pickColor}
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
        {hasUpdatedPixels && (
          <Tooltip label="Clear Updates" placement="right">
            <IconButton
              aria-label="clear"
              icon={<Icon as={ImBin} />}
              onClick={() => {
                clearUpdatedPixels()
              }}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
            />
          </Tooltip>
        )}
        {!isPixelsMenuOpen && hasUpdatedPixels && (
          <Tooltip label="Save Updates" placement="right">
            <IconButton
              aria-label="save"
              icon={<Icon as={BiSave} />}
              onClick={() => togglePixelMenu()}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
            />
          </Tooltip>
        )}
        <Tooltip label="Stencils" placement="right">
          <IconButton
            aria-label="stencils"
            icon={<Icon as={FaRegImages} />}
            _hover={{ backgroundColor: "#FF4500", color: "white" }}
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
              aria-label="hide-stencil"
              icon={<Icon as={showingStencil ? LuImageOff : LuImagePlus} />}
              _hover={{ backgroundColor: "#FF4500", color: "white" }}
              onClick={() => {
                toggleShowStencil()
              }}
            />
          </Tooltip>
        )}
      </Stack>
      {(tool == "update" || tool == "remove") && showColorPicker && (
        <Stack>
          <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
          <Editable value={selectedColor}>
            <EditablePreview />
            <EditableInput
              onChange={(e) =>
                setSelectedColor(getColorOrDefault(e.target.value))
              }
            />
          </Editable>
        </Stack>
      )}
    </HStack>
  )
}
