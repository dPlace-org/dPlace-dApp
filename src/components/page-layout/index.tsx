import { Container, ContainerProps } from "@chakra-ui/react"
import { motion, Variants } from "framer-motion"
import { NextSeo } from "next-seo"
import { ReactNode, useEffect, useState } from "react"

const variants: Variants = {
  hidden: {
    opacity: 0,
    x: 0,
    y: -40,
    transition: { duration: 0.4, type: "easeOut" },
  },
  enter: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.4, type: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -0,
    y: 40,
    transition: { duration: 0.4, type: "easeOut" },
  },
}

type PageProps = {
  title: string
  description?: string
  children: ReactNode
}

const MotionContainer = motion<ContainerProps>(Container)

const PageLayout = ({ title, description, children }: PageProps) => {
  const [cachedGrid, setCachedGridUrl] = useState("")
  useEffect(() => {
    const handler = async () => {
      try {
        let response = await fetch("/api/retrieve-grid")
        let url = await response.json()
        if (!url.message) setCachedGridUrl("/assets/images/grid-0.png")
        setCachedGridUrl(url.message)
      } catch (e) {
        console.log(e)
        setCachedGridUrl("/assets/images/grid-0.png")
      }
    }
    handler()
  }, [])

  return (
    <>
      <NextSeo
        title={title + " | dPlace"}
        description={description}
        twitter={{
          cardType: "summary_large_image",
          handle: "@dPlace",
        }}
        openGraph={{
          url: "https://dplace.fun",
          title: title + " | dPlace",
          description: description,
          locale: "en_US",
          images: [
            {
              url: cachedGrid,
              width: 1000,
              height: 1000,
              alt: "dPlace Grid",
              type: "image/png",
            },
          ],
        }}
        additionalLinkTags={[
          {
            rel: "icon",
            href: "favicon.ico",
          },
        ]}
      />
      <MotionContainer
        display="flex"
        maxW="100vw"
        minH={{ base: "auto", md: "100vh" }}
        p={0}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        centerContent
      >
        {children}
      </MotionContainer>
    </>
  )
}

export default PageLayout
