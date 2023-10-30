import { getPixels } from "@/utils/Subgraph"
import { list, put } from "@vercel/blob"
import Color from "color"
import { createReadStream, createWriteStream, unlink } from "fs"
import type { NextApiRequest, NextApiResponse } from "next"
import PNGImage from "pngjs-image"
import { cacheExchange, createClient, fetchExchange } from "urql"

type ResponseData = {
  message: string
}

// Triggered each time the “PixelChanged” event is emitted from the grid contract.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  // Retrieves the most recently built Grid PNG and retrieves all newly updated pixels from the subgraph.

  const { blobs } = await list()
  let timestamp = Number(blobs[0].pathname.split(".")[0])
  let gridUrl = blobs[0].url

  // Retrieves all pixels from subgraph and save an entirely knew PNG
  const client = createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    exchanges: [cacheExchange, fetchExchange],
    requestPolicy: "network-only",
  })
  let done = false
  let pixels = []
  let page = 0
  let pageSize = 1000

  try {
    while (!done) {
      let _pixels = await getPixels(client, timestamp, page, pageSize)
      pixels = [...pixels, ..._pixels]
      if (_pixels.length < pageSize) {
        done = true
      }
      page++
    }
  } catch (e) {
    console.log(e)
    return
  }

  let newTimestamp = 0

  PNGImage.readImage(gridUrl, async function (err, image) {
    if (err) throw err

    var png = image.getImage()

    pixels.forEach((pixel) => {
      var idx = (png.width * Number(pixel.y) + Number(pixel.x)) << 2
      if (pixel.lastUpdated > newTimestamp) {
        newTimestamp = pixel.lastUpdated
      }

      let color = new Color(pixel.color)
      png.data[idx] = Number(color.red())
      png.data[idx + 1] = Number(color.green())
      png.data[idx + 2] = Number(color.blue())
      png.data[idx + 3] = 255
    })

    let fileName = newTimestamp + ".png"
    png
      .pack()
      .pipe(createWriteStream(`/tmp/${fileName}`))
      .on("finish", async () => {
        let file = createReadStream(`/tmp/${fileName}`)
        try {
          await put(fileName, file, {
            access: "public",
          })
        } catch (e) {
          console.log(e)
        }
        await unlink(fileName, () => {})
      })
  })
  res.status(200).json({ message: "Grid updated!" })
}
