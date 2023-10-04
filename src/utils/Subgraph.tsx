import { gql, GraphQLClient as Client } from "graphql-request"
import { useEffect, useState } from "react"

import { Place } from "../components/grid/Grid"

export async function getPlaces(
  client: Client,
  timestamp: Number,
): Promise<any> {
  const q = gql`
    query getPlaces($timestamp: Int!) {
      places(where: { lastUpdated_gte: $timestamp }) {
        x
        y
        color
        lastUpdated
      }
    }
  `

  return await client.request(q, { timestamp }).then((data: any) => {
    return data.places
  })
}

export async function getPlace(
  client: Client,
  x: String,
  y: String,
): Promise<any> {
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

  // return await client
  //   .query(q, { x, y })
  //   .toPromise()
  //   .then((result) => result.data.places[0])
  //   .catch((err) => {
  //     return null
  //   })
}

export const useGetPlace = (): {
  getPlace: (x: Number, y: Number) => Promise<Place>
  loading: boolean
  error: string
} => {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const client = new Client(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT)
    setClient(client)
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

  return { getPlace: queryPlace, loading, error }
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
    const client = new Client(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT)
    setClient(client)
  }, [])

  const queryPlaces = async (timestamp: Number) => {
    if (client) {
      try {
        setLoading(true)
        let places = await getPlaces(client, timestamp)
        console.log(places)
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
