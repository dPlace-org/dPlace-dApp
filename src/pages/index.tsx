import PageLayout from "@/components/page-layout"
import { Stack } from "@chakra-ui/react"
import { useSigner } from "@thirdweb-dev/react"
import { useEffect, useState } from "react"
import Grid from "../components/grid/Grid"

const IndexPage = () => {
  const [block, setBlock] = useState<number>(0)
  const signer = useSigner()

  useEffect(() => {
    if (signer && signer.provider) {
      let provider = signer.provider
      provider.getBlockNumber().then((block) => setBlock(block))
    }
  }, [signer])

  return (
    <PageLayout
      title="Home"
      description="Discover a starter kit which includes Next.js, Chakra-UI, Framer-Motion in Typescript. You have few components, Internationalization, SEO and more in this template ! Enjoy coding."
    >
      <Stack spacing={4} w="100%" overflowY={"unset"}>
        <Grid block={block} />
      </Stack>
    </PageLayout>
  )
}

export default IndexPage
