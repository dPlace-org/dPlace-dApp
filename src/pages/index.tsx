import PageLayout from "@/components/page-layout"
import { Stack } from "@chakra-ui/react"
import GridContainer from "../components/grid/GridContainer"

const IndexPage = () => {
  return (
    <PageLayout
      title="dPlace - community owned pixels"
      description="Join the dPlace community and leave your mark on the grid"
    >
      <Stack spacing={4} w="100%" overflowY={"unset"}>
        <GridContainer />
      </Stack>
    </PageLayout>
  )
}

export default IndexPage
