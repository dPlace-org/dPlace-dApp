import { useSuiClientInfiniteQuery } from "@mysten/dapp-kit"
// import { bcs } from "@mysten/sui/dist/cjs/bcs"
// import { bcs } from "@mysten/sui/cryptography"
import { bcs } from "@mysten/sui/bcs"
import { SuiClient } from "@mysten/sui/dist/cjs/client"
import { Transaction } from "@mysten/sui/transactions"
import { useEffect, useState } from "react"
import { cacheExchange, Client, createClient, fetchExchange } from "urql"
import { Pixel } from "../components/grid/Grid"

const PAGESIZE = 100

export async function getPixelsUpdatedAfter(
  client: Client,
  timestamp: number,
  page: number,
  pageSize?: number,
): Promise<Pixel[]> {
  const q = `
  query getPixels($timestamp: Int!, $first: Int!, $skip: Int!) {
    pixels(first: $first, skip: $skip, where: {lastUpdated_gte: $timestamp}) {
      x
      y
      color
      lastUpdated
    }
  }`

  let size = pageSize ? pageSize : PAGESIZE

  let first = size
  let skip = page * size

  return await client
    .query(q, { timestamp, first, skip })
    .toPromise()
    .then((result) => result.data.pixels)
    .catch((err) => {
      return []
    })
}

export async function getOwnedPixels(
  client: Client,
  owner: String,
  page: number,
): Promise<Pixel[]> {
  const q = `
  query getOwnedPixels($owner: String!, $first: Int!, $skip: Int!) {
    pixels(first: $first, skip: $skip, where: {owner: $owner}, orderBy: lastUpdated, orderDirection: desc) {
      x
      y
      color
      lastUpdated
    }
  }`

  let first = PAGESIZE
  let skip = page * PAGESIZE

  return await client
    .query(q, { owner, first, skip })
    .toPromise()
    .then((result) => result.data.pixels)
    .catch((err) => {
      return []
    })
}

export async function getPixel(
  client: Client,
  x: String,
  y: String,
): Promise<Pixel> {
  const q = `
  query getPixel($x: String!, $y: String!) {
    pixels(where: { and: [{x: $x}, {y: $y}]}) {
      x
      y
      owner
      color
      price
      lastUpdated
    }
  }`

  return await client
    .query(q, { x, y })
    .toPromise()
    .then((result) => result.data.pixels[0])
    .catch((err) => {
      return null
    })
}

export async function getAllPixelsAfter(
  client: Client,
  timestamp: number,
): Promise<Pixel[]> {
  const q = `
  query getPixels($lastId: String!, $timestamp: Int!) {
    pixels(first: 1000, where: { and : [ { id_gt: $lastId }, { lastUpdated_gte: $timestamp}]}) {
      id
      x
      y
      owner
      color
      price
      lastUpdated
    }
  }`

  let lastId = ""
  let pixels = []
  let done = false
  while (!done) {
    let newPixels = await client
      .query(q, { lastId, timestamp })
      .toPromise()
      .then((result) => result.data.pixels)
      .catch((err) => {
        console.log(err)
        return null
      })
    if (newPixels == null) {
      done = true
      continue
    }
    pixels = [...pixels, ...newPixels]
    if (newPixels.length < 1000) {
      done = true
    }
    lastId = newPixels[newPixels.length - 1].id
  }
  return pixels
}

export const useGetPixel = (): {
  getPixel: (x: Number, y: Number) => Promise<Pixel>
  loading: boolean
  initialized: boolean
  error: string
} => {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = createClient({
      url: "/subgraph",
      exchanges: [cacheExchange, fetchExchange],
      requestPolicy: "network-only",
    })
    setClient(client)
    setInitialized(true)
  }, [])

  const queryPixel = async (x: Number, y: Number) => {
    if (client) {
      try {
        setLoading(true)
        let pixel = await getPixel(client, String(x), String(y))
        setLoading(false)
        return pixel
      } catch (err) {
        console.log(err)
        setLoading(false)
        setError(err)
      }
    }
    return null
  }

  return { getPixel: queryPixel, loading, initialized, error }
}

export const useGetOwnedPixels = (): {
  getOwnedPixels: (address: String) => Promise<Pixel[]>
  loading: boolean
  error: string
} => {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = createClient({
      url: "/subgraph",
      exchanges: [cacheExchange, fetchExchange],
      requestPolicy: "network-only",
    })
    setClient(client)
  }, [])

  const queryPixels = async (owner: String) => {
    if (client) {
      try {
        let page = 0
        setLoading(true)
        let pixels = await getOwnedPixels(client, owner, page)
        setLoading(false)
        return pixels
      } catch (err) {
        console.log(err)
        setLoading(false)
        setError(err)
      }
    }
    return []
  }

  return { getOwnedPixels: client ? queryPixels : null, loading, error }
}

// TODO:
export const useGetPixels = (): {
  getPixelsUpdatedAfter: (timestamp: Number) => Promise<Pixel[]>
  loading: boolean
  error: string
  isPending: boolean
} => {
  // const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const {
    data,
    isPending,
    isError,
    error: queryError,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useSuiClientInfiniteQuery("queryEvents", {
    query: {
      MoveEventType: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::meta_canvas::PixelsPaintedEvent`,
    },
  })

  const queryPixels = async (timestamp: number): Promise<Pixel[]> => {
    if (!isPending) {
      try {
        let pixels = {}

        setLoading(true)
        await fetchNextPage()
        let _pixels = convertEventsToPixels(data?.pages[0].data)
        _pixels?.map((_pixel) => {
          pixels[`${_pixel.x},${_pixel.y}`] = _pixel.color
        })

        while (hasNextPage) {
          let request = await fetchNextPage()
          let _pixels = convertEventsToPixels(request.data.pages[0].data)

          _pixels?.map((_pixel) => {
            pixels[`${_pixel.x},${_pixel.y}`] = _pixel.color
          })
        }

        setLoading(false)
        return Array.from(Object.entries(pixels), ([key, value]) => {
          return {
            x: Number(key.split(",")[0]),
            y: Number(key.split(",")[1]),
            color: value as String,
          } as Pixel
        })
      } catch (err) {
        console.log(err)
        setLoading(false)
        setError(err)
      }
    }
    return []
  }

  return { getPixelsUpdatedAfter: queryPixels, isPending, loading, error }
}

const convertEventsToPixels = (events: any[]): Pixel[] => {
  let pixels = []
  events.map((event) => {
    let json = event.parsedJson as any
    return json.color.map((color, index) => {
      let pixel: Pixel = {
        x: Number(json.pixels_x[index]),
        y: Number(json.pixels_y[index]),
        color,
      }
      pixels.push(pixel)
    })
  })
  return pixels
}

export const calculatePixelsCost = async (
  client: SuiClient,
  account: string,
  xs: number[],
  ys: number[],
): Promise<number> => {
  const feeTx = new Transaction()
  feeTx.moveCall({
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::meta_canvas::calculate_pixels_paint_fee`,
    arguments: [
      feeTx.object(process.env.NEXT_PUBLIC_META_CANVAS_ID),
      feeTx.pure.vector("u64", xs),
      feeTx.pure.vector("u64", ys),
      feeTx.object("0x6"),
    ],
  })

  const testResult = await client.devInspectTransactionBlock({
    sender: account,
    transactionBlock: feeTx,
  })

  const returnValues = testResult?.results?.[0]?.returnValues?.[0][0]

  const fee =
    returnValues === undefined
      ? 0
      : Number(bcs.U64.parse(new Uint8Array(returnValues)))

  return fee
}
