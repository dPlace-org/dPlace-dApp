import PageLayout from "@/components/page-layout"
import { Stack } from "@chakra-ui/react"
import GridContainer from "../components/grid/GridContainer"

const IndexPage = () => {
  return (
    <PageLayout
      title="Home"
      description="Discover a starter kit which includes Next.js, Chakra-UI, Framer-Motion in Typescript. You have few components, Internationalization, SEO and more in this template ! Enjoy coding."
    >
      <Stack spacing={4} w="100%" overflowY={"unset"}>
        <GridContainer />
      </Stack>
    </PageLayout>
  )
}

export default IndexPage
