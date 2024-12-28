import { CSSProperties, ReactNode } from "react"

export * from "./CountTuple"
export * from "./ObjectKeys"

export { type CSSProperties }

export type TODO<T> = T
export type Primitive = string | number | boolean
export type OnlyPrimitiveFields<T extends Record<string, unknown>> = { [K in keyof T]:T[K] extends Primitive ? T[K] : never}
export type EmailString = `${string}@${string}.${string}`
export type FullDateFormatString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`
export type NumberString = `${number}` | `${number}.${number}`
export type Asyncable<T> = T | Promise<T>
export type AbsolutePath = `/${string}`
export type URLStrig = `http${`s` | ``}://${string}.${string}`
export type Arrayable<T> = T | T[]
export type Promiseable<T> = T | Promise<T>
export type HTMLTagName = keyof JSX.IntrinsicElements
export type Override<What, With> = Omit<What, keyof With> & With


export type OnlyChildren<T = ReactNode> = { children: T, body?: never }
export type OnlyBodyProp<T = ReactNode> = { children?: never, body: T }
export type ElementChildren<T = ReactNode> = OnlyChildren<T> | OnlyBodyProp<T>
export type StyledElementWithChildren = ElementChildren & {
  className?: string
  style?: CSSProperties
}

export type OptionalExcess<Shape extends Record<string, unknown>, RequiredShape extends Record<string, unknown>> =
  | Partial<Shape> & Required<RequiredShape>

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | Date
  | { [x:string]: JSONValue }
  | Array<JSONValue>;

export type ObjectJSONValue = Record<string, JSONValue>
