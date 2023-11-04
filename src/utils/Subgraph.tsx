import { useEffect, useState } from "react"
import { cacheExchange, Client, createClient, fetchExchange } from "urql"
import { Pixel } from "../components/grid/Grid"

const PAGESIZE = 100

export async function getPixels(
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

export const useGetPixels = (): {
  getPixels: (timestamp: Number) => Promise<Pixel[]>
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

  const queryPixels = async (timestamp: number) => {
    if (client) {
      try {
        let done = false
        let pixels = []
        let page = 0
        setLoading(true)
        while (!done) {
          let _pixels = await getPixels(client, timestamp, page)
          pixels = [...pixels, ..._pixels]
          if (_pixels.length < PAGESIZE) {
            done = true
          }
          page++
        }
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

  return { getPixels: queryPixels, loading, error }
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
