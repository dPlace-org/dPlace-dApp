import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react"

export const FAQ = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        alignSelf={"center"}
        p="2em"
        mt={{ sm: "16em", md: "0" }}
        display="grid"
      >
        <ModalCloseButton />
        <Stack>
          <Heading>FAQ</Heading>
          <Accordion>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  How much does it cost to color a pixel? / how are pixels
                  priced?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                The base price is .00001 ETH increasing slightly each time a
                pixel is colored. <br /> <br />A price decay causes the price of
                each pixel to halve every 24 hours.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  What happens if someone overwrites my pixel?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                At the very least you will receive the base price of .00001 ETH
                back, but you may not receive the full value if the price decay
                causes the replacement cost to be less than your purchase price.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  How do I collect my pixel refunds?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                The withdraw button appears when you have ETH to claim from your
                pixel being replaced. It will appear at the top right corner of
                the app.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  What log in types are supported?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                Wallet connect, twitter, email, or phone
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  What is the stencil tool used for?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                The stencil tool allows you to upload an image (pixel art works
                best) that can be painted over to help create your art.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  Can I share my stencil?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                Yes! Make sure a stencil is selected and then copy the website
                url to share with your friends.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  How do I select a color already on the grid?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                Paint brush {">"} color palette {">"} eye dropper {">"} select
                the pixel. <br /> <br />
                On mobile, you can use the pixel viewer tool (the magnifying
                glass) to select a pixel. This will automatically set the color
                of the pixel you select.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  Why only 200 pixels at a time?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                Claiming more pixels at once increases the chance your
                transaction will fail.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
                  How do I see who owns a pixel?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                Magnifying glass {">"} click pixel
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Stack>
      </ModalContent>
    </Modal>
  )
}
