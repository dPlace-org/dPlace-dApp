import { getScaleForWidth } from "@/utils/utils"
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image as ChakraImage,
  Input,
  Link,
  Progress,
  Stack,
} from "@chakra-ui/react"
import { useStorageUpload } from "@thirdweb-dev/react"
import { Field, Form, Formik } from "formik"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useLocalStorage } from "react-use"
import { Pixel } from "./Grid"

const defaultWidth = 100

// pass stencilCanvas ref to this component
export default function StencilManager({
  onClose,
  isOpen,
  centerOn,
  stencilCanvas,
}: {
  onClose: () => void
  isOpen: boolean
  centerOn: (pixel: Pixel, scale: number) => void
  stencilCanvas: CanvasRenderingContext2D | null
}) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [addingStencil, setAddingStencil] = useState(false)
  const [file, setFile] = useState<File>(null)
  const [previewStencil, setPreviewStencil] = useState(null)
  const [callerStencils, setCallerStencils] = useState([])
  const [storageStencils, saveStorageStencils] = useLocalStorage("stencils", [])

  const { mutateAsync: upload } = useStorageUpload({
    onProgress: ({ progress, total }) => {
      progress === total
        ? setProgress(0)
        : setProgress((progress / total) * 100)
    },
    uploadWithoutDirectory: false,
    uploadWithGatewayUrl: true,
  })

  const uploadStencil = async (
    file: File,
    startingX: number,
    startingY: number,
    imageWidth: number,
  ) => {
    if (!file) return
    try {
      let substring = file.name.split(".")
      let type = substring[substring.length - 1].toUpperCase()
      let newFileName = startingX + "-" + startingY + "-" + imageWidth
      let newFile = new File([file], newFileName + "." + type, {
        type: file.type,
      })

      let ipfsUpload = await upload({ data: [newFile] })
      saveStorageStencils([
        ...storageStencils,
        ipfsUpload[0].replace("https://", ""),
      ])
    } catch (e) {
      console.log(e)
    }
  }

  const handleAddingStencil = () => {
    stencilCanvas.clearRect(0, 0, 1000, 1000)
    setAddingStencil(true)
  }

  const handleNewStencilPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    let image = e.currentTarget.files[0]
    setFile(image)
    if (!image) {
      if (stencilCanvas) {
        stencilCanvas.clearRect(
          0,
          0,
          stencilCanvas.canvas.width,
          stencilCanvas.canvas.height,
        )
      }
      return
    }

    const reader = new FileReader()

    reader.onloadend = () => {
      setPreviewStencil(reader.result)
    }

    reader.readAsDataURL(image)
  }

  const handleStencilMoved = (
    startingX: number,
    startingY: number,
    imageWidth: number,
  ) => {
    if (!stencilCanvas || !previewStencil) return
    var stencilImage = new Image()
    stencilImage.src = previewStencil
    stencilImage.onload = () => {
      stencilCanvas.clearRect(
        0,
        0,
        stencilCanvas.canvas.width,
        stencilCanvas.canvas.height,
      )
      let sizeRatio = imageWidth / stencilImage.width
      stencilCanvas.drawImage(
        stencilImage,
        startingX,
        startingY,
        imageWidth,
        stencilImage.height * sizeRatio,
      )
    }
  }

  useEffect(() => {
    if (!stencilCanvas) return
    if (previewStencil) {
      var stencilImage = new Image()
      stencilImage.src = previewStencil
      stencilImage.onload = () => {
        stencilCanvas.clearRect(
          0,
          0,
          stencilCanvas.canvas.width,
          stencilCanvas.canvas.height,
        )
        let sizeRatio = defaultWidth / stencilImage.width
        stencilCanvas.drawImage(
          stencilImage,
          0,
          0,
          defaultWidth,
          stencilImage.height * sizeRatio,
        )
        centerOn({ x: 50, y: 50 }, getScaleForWidth(defaultWidth))
      }
    } else {
      stencilCanvas.clearRect(
        0,
        0,
        stencilCanvas.canvas.width,
        stencilCanvas.canvas.height,
      )
    }
  }, [previewStencil, stencilCanvas])

  useEffect(() => {
    if (setCallerStencils && callerStencils) {
      setCallerStencils(storageStencils)
    }
  }, [callerStencils])

  useEffect(() => {
    if (!stencilCanvas) return
    if (!router.query.stencil) {
      // stencilCanvas.clearRect(
      //   0,
      //   0,
      //   stencilCanvas.canvas.width,
      //   stencilCanvas.canvas.height,
      // )
      // centerOn({ x: 500, y: 500 }, 10)
      return
    }
    let stencil = router.query.stencil as string
    // draw stencil image on canvas
    let substring = stencil.split("/")
    let fileName = substring[substring.length - 1]
    let config = fileName.split(".")[0].split("-")
    let x = Number(config[0])
    let y = Number(config[1])
    let width = Number(config[2])
    var stencilImage = new Image()
    stencilImage.src = "https://" + stencil
    stencilImage.onload = () => {
      let sizeRatio = width / stencilImage.width
      stencilCanvas.clearRect(
        0,
        0,
        stencilCanvas.canvas.width,
        stencilCanvas.canvas.height,
      )
      stencilCanvas.drawImage(
        stencilImage,
        x,
        y,
        width,
        stencilImage.height * sizeRatio,
      )
      let centerX = x + width / 2
      let centerY = y + (stencilImage.height * sizeRatio) / 2
      centerOn({ x: centerX, y: centerY }, getScaleForWidth(width))
    }
  }, [router, stencilCanvas])

  return (
    <Drawer
      blockScrollOnMount={false}
      placement={"right"}
      onClose={onClose}
      isOpen={isOpen}
      closeOnOverlayClick={false}
    >
      <DrawerContent containerProps={{ width: "0" }} overflow="scroll">
        <DrawerBody bgColor="#FF4500" mt="5.5em" p="1em" pt="0 !important">
          <Stack
            w="100%"
            bgColor="transparent"
            h="100%"
            justifyContent={"space-between"}
          >
            <Stack
              padding="1em"
              spacing="1em"
              bgColor="white"
              boxShadow="inset 0px 5px 5px rgb(0 0 0 / 28%)"
            >
              {!addingStencil ? (
                <Stack>
                  {callerStencils.length > 0 && (
                    <>
                      <Heading
                        fontSize={"1.5em"}
                        fontFamily="minecraft"
                        letterSpacing={"1px"}
                      >
                        Your Stencils
                      </Heading>
                      <HStack overflowX="auto">
                        {storageStencils.map((stencil, index) => (
                          <Link
                            minW="5em"
                            key={index}
                            isExternal={false}
                            as={NextLink}
                            href={`?stencil=${stencil}`}
                          >
                            <ChakraImage w="5em" src={`https://${stencil}`} />
                          </Link>
                        ))}
                      </HStack>
                      <Divider />
                    </>
                  )}
                  <Button
                    fontFamily="minecraft"
                    letterSpacing="1px"
                    fontSize="18px"
                    backgroundColor="#FF4500"
                    color="#fff"
                    _hover={{ backgroundColor: "#c53500" }}
                    onClick={handleAddingStencil}
                  >
                    New Stencil
                  </Button>
                </Stack>
              ) : (
                <Formik
                  initialValues={{
                    startingX: 0,
                    startingY: 0,
                    imageWidth: defaultWidth,
                  }}
                  onSubmit={async ({ startingX, startingY, imageWidth }) => {
                    await uploadStencil(file, startingX, startingY, imageWidth)
                    setAddingStencil(false)
                  }}
                >
                  {({ values }) => (
                    <Form>
                      <Stack>
                        <label
                          htmlFor="file-upload"
                          style={{ fontFamily: "minecraft" }}
                        >
                          Upload file
                        </label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/png, image/jpeg"
                          className="file-upload"
                          userSelect={"none"}
                          onChange={handleNewStencilPicked}
                        />
                        {file && (
                          <>
                            <Field name="startingX">
                              {({ field, form }) => (
                                <FormControl
                                  isInvalid={
                                    form.errors.name && form.touched.name
                                  }
                                >
                                  <FormLabel htmlFor="startingX">
                                    Starting X
                                  </FormLabel>
                                  <Input
                                    {...field}
                                    id="startingX"
                                    placeholder="0"
                                    type="number"
                                    onChange={(e) => {
                                      form.handleChange(e)
                                      handleStencilMoved(
                                        Number(e.target.value),
                                        values.startingY,
                                        values.imageWidth,
                                      )
                                    }}
                                    value={form.values.startingX}
                                  />
                                </FormControl>
                              )}
                            </Field>
                            <Field name="startingY">
                              {({ field, form }) => (
                                <FormControl
                                  isInvalid={
                                    form.errors.name && form.touched.name
                                  }
                                >
                                  <FormLabel htmlFor="startingY">
                                    Starting Y
                                  </FormLabel>
                                  <Input
                                    {...field}
                                    id="startingY"
                                    placeholder="0"
                                    type="number"
                                    onChange={(e) => {
                                      form.handleChange(e)
                                      handleStencilMoved(
                                        values.startingX,
                                        Number(e.target.value),
                                        values.imageWidth,
                                      )
                                    }}
                                    value={form.values.startingY}
                                  />
                                </FormControl>
                              )}
                            </Field>
                            <Field name="imageWidth">
                              {({ field, form }) => (
                                <FormControl
                                  isInvalid={
                                    form.errors.name && form.touched.name
                                  }
                                >
                                  <FormLabel htmlFor="imageWidth">
                                    Width
                                  </FormLabel>
                                  <Input
                                    required
                                    {...field}
                                    id="imageWidth"
                                    placeholder="100"
                                    type="number"
                                    onChange={(e) => {
                                      form.handleChange(e)
                                      handleStencilMoved(
                                        values.startingX,
                                        values.startingY,
                                        Number(e.target.value),
                                      )
                                    }}
                                    value={form.values.imageWidth}
                                  />
                                </FormControl>
                              )}
                            </Field>
                          </>
                        )}
                        <Stack>
                          <Button
                            fontFamily="minecraft"
                            letterSpacing="1px"
                            fontSize="18px"
                            backgroundColor="#FF4500"
                            color="#fff"
                            _hover={{ backgroundColor: "#c53500" }}
                            type="submit"
                            mt="1em"
                            w="100%"
                          >
                            Upload Stencil
                          </Button>
                          {progress > 0 && (
                            <Progress color="#FF4500" value={progress} />
                          )}
                          <Button
                            variant={"outline"}
                            fontFamily="minecraft"
                            letterSpacing="1px"
                            fontSize="18px"
                            color="#FF4500"
                            borderColor={"#FF4500"}
                            _hover={{ backgroundColor: "#ebebeb" }}
                            onClick={() => {
                              if (stencilCanvas)
                                stencilCanvas.clearRect(0, 0, 1000, 1000)
                              setAddingStencil(false)
                              setPreviewStencil(null)
                            }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              )}
            </Stack>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
