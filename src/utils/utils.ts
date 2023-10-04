export const trimAddress = (address: string, length: number): string => {
  if (length <= 0) return ""
  if (length * 2 >= address.length) return address

  let left = address.slice(0, length)
  let right = address.slice(-length)

  return `${left}...${right}`
}
