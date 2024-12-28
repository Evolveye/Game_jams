import { useImperativeHandle, useRef, useState } from "react"

export type InputEvent<T> = T & { value:string, setValue:(value:string) => void }
export type InputFocusEvent = InputEvent<React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>>
export type InputChangeEvent = InputEvent<React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>
export type InputOnChange = (eOrcheckOrVal:boolean | string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void

export type InputProps<TRef> = {
  ref?: React.ForwardedRef<TRef | null>
  value?: string
  checked?: boolean
  defaultValue?: string
  defaultChecked?: boolean
  internalState?: boolean
  onChange?: InputOnChange
  validate?: (value:string) => string
}
export type NativeInputProps<TRef extends HTMLElement> = {
  ref?: React.RefObject<TRef>
  value?: string
  checked?: boolean
  defaultValue?: string
  defaultChecked?: boolean
  onChange: InputOnChange
}

export default function useFormInputStateProps<TRef extends HTMLElement = HTMLInputElement>({ value:externalValue, checked:externalChecked, defaultValue, defaultChecked, ...props }:InputProps<TRef>) {
  if (props.internalState && externalValue) throw new Error( `Hook useFormInputStateProps cannot have internal value and "value" property )external value) at the same time` )

  const ref = useRef<TRef>( null )

  useImperativeHandle( props.ref, () => ref.current as TRef )

  const [ internalState, setInternalState ] = useState({
    value: props.internalState ? externalValue ?? defaultValue : undefined,
    checked: props.internalState ? externalChecked ?? defaultChecked : undefined,
  })

  const inputStateProps:NativeInputProps<TRef> = {
    ref,
    onChange: (eOrcheckOrVal:boolean | string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      // eslint-disable-next-line prefer-const
      let [ newValue, newChecked ] = typeof eOrcheckOrVal === `boolean` ? [ externalValue, eOrcheckOrVal ]
        : typeof eOrcheckOrVal === `string` ? [ eOrcheckOrVal, externalChecked ]
          : [ eOrcheckOrVal.target.value, eOrcheckOrVal.target.tagName === `input` ?  (eOrcheckOrVal.target as HTMLInputElement).checked : undefined ]

      if (typeof newValue === `string` && props.validate) newValue = props.validate( newValue )

      const isChangedValue = newValue !== externalValue
      const isChangedChecked = newChecked !== externalChecked

      if (!isChangedValue && !isChangedChecked) return
      if (props.internalState) setInternalState({ value:newValue ?? internalState.value, checked:newChecked ?? internalState.checked })

      props.onChange?.( eOrcheckOrVal )
    },
  }

  if (internalState.value !== undefined || externalValue !== undefined) inputStateProps.value = internalState.value ?? externalValue
  if (internalState.checked !== undefined || externalChecked !== undefined) inputStateProps.checked = internalState.checked ?? externalChecked
  if (inputStateProps.value === undefined && defaultValue !== undefined) inputStateProps.defaultValue = defaultValue
  if (inputStateProps.checked === undefined && defaultChecked !== undefined) inputStateProps.defaultChecked = defaultChecked

  const isControlled = inputStateProps.value !== undefined || inputStateProps.checked !== undefined

  return [ inputStateProps, isControlled ] as const
}

export const inputValueTesters = {
  checkIsEmail: (v:string) => !/[\w.-]+@[\w.-]+\.[a-z]{2,}$/.test( v ),
}
