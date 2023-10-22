import { Button, Heading, Progress, Stack } from "@chakra-ui/react"
import { useSigner, useStorage, useStorageUpload } from "@thirdweb-dev/react"
import { useState } from "react"
import { FileUploader } from "react-drag-drop-files"
import { useLocalStorage } from "react-use"

const fileTypes = ["PNG"]

export default function StencilManager() {
  const startingX = 0
  const startingY = 0
  const pixelWidth = 10

  const [file, setFile] = useState<File>(null)
  const [progress, setProgress] = useState(0)
  const [callerStencils, setCallerStencils] = useState([])
  const [storagePixels, saveStoragePixels] = useLocalStorage("stencils", [])
  const signer = useSigner()

  const handleChange = (file) => {
    setFile(file)
  }

  const storage = useStorage()

  const { mutateAsync: upload } = useStorageUpload({
    onProgress: ({ progress, total }) => {
      progress === total
        ? setProgress(0)
        : setProgress((progress / total) * 100)
    },
    uploadWithoutDirectory: false,
    uploadWithGatewayUrl: true,
  })

  const handleUpload = async () => {
    // TODO: save IPFS url to local storage
    let newFileName =
      (await signer.getAddress()) +
      `${"/"}` +
      startingX +
      "-" +
      startingY +
      "-" +
      pixelWidth
    let newFile = new File([file], newFileName + ".png", {
      type: file.type,
    })
    console.log(newFile)
    let test = await upload({ data: [newFile] })
    console.log(test)
  }

  return (
    <Stack
      padding="1em"
      spacing="2em"
      bgColor="white"
      boxShadow="inset 0px 5px 5px rgb(0 0 0 / 28%)"
    >
      <FileUploader
        handleChange={handleChange}
        name="new-stencil"
        types={fileTypes}
      >
        <div
          style={{
            textAlign: "center",
            padding: "1em",
            border: "1px dashed black",
            borderRadius: "1em",
            cursor: "pointer",
          }}
        >
          {file ? (
            file.name
          ) : (
            <>
              <p style={{ fontWeight: "bold" }}>Upload an image</p>
              <p>{"(png or jpeg)"}</p>
            </>
          )}
        </div>
      </FileUploader>
      <Button
        fontFamily="minecraft"
        letterSpacing="1px"
        fontSize="18px"
        backgroundColor="#FF4500"
        color="#fff"
        _hover={{ backgroundColor: "#FF4500" }}
        onClick={handleUpload}
        isDisabled={!file}
      >
        Upload Stencil
      </Button>
      {progress && <Progress value={progress} />}
      <Heading
        alignSelf={"center"}
        fontSize={"1.5em"}
        fontFamily="minecraft"
        letterSpacing={"1px"}
      >
        Your Stencils
      </Heading>
    </Stack>
  )
}
