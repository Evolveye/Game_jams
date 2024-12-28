import { useReducer, useState } from "react"

export type FormInputConfig = {
  name: string
  initialValue?: string
  initiallyChecked?: boolean
}

export type FormInputData = FormInputConfig & {
  value?: string
  checked?: boolean
}

export type FormConfiguration = Record<string, string | FormInputConfig>

export default function useFormState<T extends Omit<FormConfiguration, `name`>>( config:T ) {
  type InputName = keyof T

  const [ savedInitialConfig ] = useState( normalizeFormConfiguration( config ) )
  type FormValues = typeof savedInitialConfig
  type SetterFormValues = Partial<Record<InputName, Partial<FormInputData>>>

  const [ inputDataset, dispatch ] = useReducer( (prev:FormValues, next:SetterFormValues) => {
    return { ...prev, ...next } as FormValues
  }, savedInitialConfig )

  const getInputProps = (name:InputName, type?:`text` | `radio` | `checkbox` | (string & {})) => {
    const isCheckableInput = type && [ `radio`, `checkbox` ].includes( type )
    const inputData = inputDataset[ name ]

    return {
      name,
      value: inputData.value,
      checked: isCheckableInput ? inputData.checked : undefined,
      onChange: (eOrVal:string | React.ChangeEvent<HTMLInputElement>) => {
        dispatch( { [ name ]: {
          value: typeof eOrVal === `string` ? eOrVal : eOrVal.target.value,
        } } as SetterFormValues )
      },
    }
  }

  return [ inputDataset, { getInputProps } ]
}

function normalizeFormConfiguration<T extends Omit<FormConfiguration, `name`>>( config:T ) {
  const entries = Object.entries( config ).map<[keyof T, FormInputData]>( ([ k, v ]) => typeof v === `string`
    ? [ k, { name:k, value:v } ]
    : [ k, { ...v, name:k, value:v.initialValue ?? ``, checked:v.initiallyChecked } ],
  )

  return Object.fromEntries( entries ) as Record<keyof T, FormInputData>
}
