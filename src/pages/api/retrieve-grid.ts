import { list } from "@vercel/blob"
import type { NextApiRequest, NextApiResponse } from "next"
import { retry } from "ts-retry-promise"

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  let url = ""
  await retry(
    async () => {
      const { blobs } = await list({ prefix: `grid` })
      const response = await fetch(blobs[0].url)
      url = (await response.json()).grid
    },
    { retries: 5, delay: 500 },
  )

  res.status(200).json({ message: url })
}
