import { getAllPixelsAfter } from "@/utils/Subgraph"
import { del, list, put } from "@vercel/blob"
import Color from "color"
import { createReadStream, createWriteStream, unlink } from "fs"
import type { NextApiRequest, NextApiResponse } from "next"
import { PNG } from "pngjs"
import { cacheExchange, createClient, fetchExchange } from "urql"

type ResponseData = {
  message: string
}

// Triggered once an hour to ensure that an accurate version of the Grid is generated using fresh data from subgraph.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  // Retrieves all pixels from subgraph and save an entirely knew PNG
  const client = createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    exchanges: [cacheExchange, fetchExchange],
    requestPolicy: "network-only",
  })

  let pixels = await getAllPixelsAfter(client, 0)

  var png = new PNG({
    width: 1000,
    height: 1000,
  })

  let timestamp = 0
  pixels.forEach((pixel) => {
    var idx = (png.width * Number(pixel.y) + Number(pixel.x)) << 2
    if (pixel.lastUpdated > timestamp) {
      timestamp = pixel.lastUpdated
    }

    let color = new Color(pixel.color)
    png.data[idx] = Number(color.red())
    png.data[idx + 1] = Number(color.green())
    png.data[idx + 2] = Number(color.blue())
    png.data[idx + 3] = 255
  })
  let fileName = timestamp + ".png"
  png
    .pack()
    .pipe(createWriteStream(`/tmp/${fileName}`))
    .on("finish", async () => {
      let file = createReadStream(`/tmp/${fileName}`)
      try {
        let response = await put(fileName, file, {
          access: "public",
        })
        const { blobs } = await list({ prefix: `grid` })
        if (blobs.length > 0)
          blobs.forEach(async (blob) => {
            await del(blob.url)
          })
        await put("grid.json", JSON.stringify({ grid: response.url }), {
          access: "public",
        })
      } catch (e) {
        console.log(e)
      }
      await unlink(fileName, () => {})
    })
  res.status(200).json({ message: "Grid rebuilt!" })
}
