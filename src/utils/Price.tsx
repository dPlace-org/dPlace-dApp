import { useEffect, useState } from "react"

const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`

export const useCalculatePriceUSD = ({
  ethAmount,
}: {
  ethAmount: string
}): {
  usdPrice: string
  loading: boolean
  error: string
} => {
  const [ethPrice, setEthPrice] = useState<number>(0)
  const [usdPrice, setUsdPrice] = useState<string>("0.0")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let handler = async () => {
      let ethPrice = await getEthPrice()
      setEthPrice(ethPrice)
    }
    if (ethPrice == 0) handler()
  }, [])

  useEffect(() => {
    if (ethPrice !== 0) {
      let _usdPrice = ethPrice * Number(ethAmount)
      setUsdPrice(_usdPrice.toFixed(_usdPrice == 0 ? 2 : 4))
    }
  }, [ethPrice, ethAmount])

  const getEthPrice = async (): Promise<number> => {
    try {
      setLoading(true)
      let data = await (await fetch(COINGECKO_URL)).json()
      setLoading(false)
      return data.ethereum.usd
    } catch (e) {
      console.log(e)
      setError(e.message)
      setLoading(false)
      return 0
    }
  }

  return { usdPrice, loading, error }
}
