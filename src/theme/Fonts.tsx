import { Global } from "@emotion/react"

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: 'minecraft';
        src: url('assets/fonts/Minecraft.ttf') format('truetype');
      }
      `}
  />
)

export default Fonts
