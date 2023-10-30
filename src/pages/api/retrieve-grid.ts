import { list } from "@vercel/blob"
import type { NextApiRequest, NextApiResponse } from "next"

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const { blobs } = await list({ prefix: `grid` })

  const response = await fetch(blobs[0].url)

  let url = (await response.json()).grid

  res.status(200).json({ message: url })
}
