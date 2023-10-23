export const trimAddress = (address: string, length: number): string => {
  if (length <= 0) return ""
  if (length * 2 >= address.length) return address

  let left = address.slice(0, length)
  let right = address.slice(-length)

  return `${left}...${right}`
}

export const getTextForColor = (bgColor: string): string => {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor
  var r = parseInt(color.substring(0, 2), 16) // hexToR
  var g = parseInt(color.substring(2, 4), 16) // hexToG
  var b = parseInt(color.substring(4, 6), 16) // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black" : "white"
}

export const getColorOrDefault = (color: string): string => {
  if (!/^#[0-9A-F]{6}$/i.test(color)) return "#FF4500"
  return color
}
