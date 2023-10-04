import { extendTheme, theme as base } from "@chakra-ui/react"

const styles = {
  global: (props) => ({
    body: {
      // bg: "linear-gradient(#131313 0,#131313 100%)",
      bg: "#ecebe7",
    },
  }),
}

const colors = {
  brand: {
    50: "#f6e8ff",
    100: "#e3bdff",
    200: "#cd94ff",
    300: "#b46ef7",
    400: "#9a4ce7",
    500: "#7e31ce",
    600: "#641eab",
    700: "#4b1483",
    800: "#341158",
    900: "#1e0d2d",
  },
}

const fonts = {
  // body: "minecraft",
  // heading: "minecraft",
  // mono: "minecraft",
}

const components = {
  Button: {
    variants: {
      pill: (props) => ({
        ...base.components.Button.variants.outline(props),
        rounded: "full",
        color: "gray.500",
      }),
    },
  },
}

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
}

const theme = extendTheme({ config, styles, colors, fonts, components })
export default theme
