import { useEffect, useState } from "react"

const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd`

export const useCalculatePriceUSD = ({
  suiAmount,
}: {
  suiAmount: string
}): {
  usdPrice: string
  loading: boolean
  error: string
} => {
  const [suiPrice, setSuiPrice] = useState<number>(0)
  const [usdPrice, setUsdPrice] = useState<string>("0.0")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let handler = async () => {
      let suiPrice = await getSuiPrice()
      setSuiPrice(suiPrice)
    }
    if (suiPrice == 0) handler()
  }, [])

  useEffect(() => {
    if (suiPrice !== 0) {
      let _usdPrice = suiPrice * Number(suiAmount)
      setUsdPrice(_usdPrice.toFixed(_usdPrice == 0 ? 2 : 4))
    }
  }, [suiPrice, suiAmount])

  const getSuiPrice = async (): Promise<number> => {
    try {
      setLoading(true)
      let data = await (await fetch(COINGECKO_URL)).json()
      setLoading(false)
      return data.sui.usd
    } catch (e) {
      console.log(e)
      setError(e.message)
      setLoading(false)
      return 0
    }
  }

  return { usdPrice, loading, error }
}
