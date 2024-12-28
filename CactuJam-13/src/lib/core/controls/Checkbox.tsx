"use client"

import { ChangeEvent, useState, useId } from "react"
import cn from "../functions/createClassName"

export type CheckboxProps = {
  className?: string
  name: string
  radio?: boolean
  checked?: boolean
  value?: string
  label?: string
  readOnly?: boolean
  onChange?: (checked:boolean, value:string) => void
}

export default function Checkbox({ className, name, readOnly, value = ``, radio, label, checked:externalChecked, onChange }:CheckboxProps) {
  const id = useId()
  const [ internalChecked, setInternalChecked ] = useState( externalChecked ?? false )

  const props = {
    type: radio ? `radio` : `checkbox`,
    name,
    defaultChecked: onChange || readOnly ? undefined : externalChecked,
    checked: externalChecked === undefined ? internalChecked : externalChecked,
    className: cn( className ),
    id,
    onChange: (e:ChangeEvent<HTMLInputElement>) => {
      let newChecked = e.target.checked

      if (externalChecked === undefined) setInternalChecked( newChecked )
      if (!onChange) return

      onChange( newChecked, value )
    },
  }

  if (!label) return <input {...props} />
  return (
    <div>
      <input {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

// const useStyles = createStylesHook( ({ components }) => ({
//   checkbox: {
//     accentColor: `currentColor`,

//     ...components.Checkbox,
//   },
// }) )
