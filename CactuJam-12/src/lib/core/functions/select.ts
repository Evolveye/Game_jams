type Key = undefined | string | number

type SelectType<K extends Key> = {[key in NonNullable<K>]?:unknown} & {
  default?: unknown
}

type SelectReturnType<K extends Key, V extends SelectType<K>> =
  | K extends keyof V
    ? V[K]
    : "default" extends keyof V
      ? V["default"]
      : undefined

export default function select<K extends Key, V extends SelectType<K>>( key:K, values:V ): SelectReturnType<K, V>  {
  if (key) {
    const selectedValue = values[ key as string ]

    if (selectedValue) return selectedValue as SelectReturnType<K, V>
  }

  return (`default` in values ? values.default : undefined) as SelectReturnType<K, V>
}
