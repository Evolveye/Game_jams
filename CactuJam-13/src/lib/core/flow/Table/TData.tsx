import { ReactNode } from "react"
import { TextAlign } from "../Text"

export type TDataProps = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  width?: number
  align?: TextAlign
}

export default function TData({ children, className, style, width, align }:TDataProps) {
  style ||= {}
  if (width) style.width = `${width}px`
  if (align) style.textAlign = align

  return (
    <td className={className} style={Object.keys( style ).length === 0 ? undefined : style}>
      {children}
    </td>
  )
}
