import { useEffect, useState } from "react"
import { cacheExchange, Client, createClient, fetchExchange } from "urql"
import { Place } from "../components/grid/Grid"

const PAGESIZE = 100

export async function getPlaces(
  client: Client,
  timestamp: number,
  page: number,
): Promise<Place[]> {
  const q = `
  query getPlaces($timestamp: Int!, $first: Int!, $skip: Int!) {
    places(first: $first, skip: $skip, where: {lastUpdated_gte: $timestamp}) {
      x
      y
      color
      lastUpdated
    }
  }`

  let first = PAGESIZE
  let skip = page * PAGESIZE

  return await client
    .query(q, { timestamp, first, skip })
    .toPromise()
    .then((result) => result.data.places)
    .catch((err) => {
      return []
    })
}

export async function getPlace(
  client: Client,
  x: String,
  y: String,
): Promise<Place> {
  const q = `
  query getPlace($x: String!, $y: String!) {
    places(where: { and: [{x: $x}, {y: $y}]}) {
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
    .then((result) => result.data.places[0])
    .catch((err) => {
      return null
    })
}

export const useGetPlace = (): {
  getPlace: (x: Number, y: Number) => Promise<Place>
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

  const queryPlace = async (x: Number, y: Number) => {
    if (client) {
      try {
        setLoading(true)
        let place = await getPlace(client, String(x), String(y))
        setLoading(false)
        return place
      } catch (err) {
        console.log(err)
        setLoading(false)
        setError(err)
      }
    }
    return null
  }

  return { getPlace: queryPlace, loading, initialized, error }
}

export const useGetPlaces = (): {
  getPlaces: (timestamp: Number) => Promise<Place[]>
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

  const queryPlaces = async (timestamp: number) => {
    if (client) {
      try {
        let done = false
        let places = []
        let page = 0
        setLoading(true)
        while (!done) {
          let _places = await getPlaces(client, timestamp, page)
          places = [...places, ..._places]
          if (_places.length < PAGESIZE) {
            done = true
          }
          page++
        }
        setLoading(false)
        return places
      } catch (err) {
        console.log(err)
        setLoading(false)
        setError(err)
      }
    }
    return []
  }

  return { getPlaces: queryPlaces, loading, error }
}
