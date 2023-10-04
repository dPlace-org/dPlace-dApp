import jazzicon from "@metamask/jazzicon"
import { useLayoutEffect, useMemo, useRef } from "react"

export default function Identicon({
  account,
  size,
}: {
  account: string
  size?: number
}) {
  const iconSize = size ?? 24

  const icon = useMemo(
    () => account && jazzicon(iconSize, parseInt(account.slice(2, 10), 16)),
    [account, iconSize],
  )
  const iconRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e) {
          console.error("Avatar icon not found")
        }
      }
    }
    return
  }, [icon, iconRef])

  return <div style={{ width: iconSize, height: iconSize }} ref={iconRef} />
}
