"use client"

import { ChangeEvent, FocusEvent, useRef, useState, useEffect, MutableRefObject } from "react"
import select from "@lib/core/functions/select"
import copy from "@lib/core/functions/copy"
import cn from "../functions/createClassName"
import { AutoComplete } from "./autocomplete"
import classes from "./Input.module.css"

export type InputEvent<T> = T & { value: string, setValue: (value:string) => void}

export type InputFocusEvent = InputEvent<FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>>
export type InputChangeEvent = InputEvent<ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>
export type InputType = `text` | `multiline-text` | `password`

export type InputProps = {
  className?: string | {override: undefined | string }
  value?: string
  initialValue?: string
  style?: React.CSSProperties
  width?: number | string
  type?: InputType
  name: string
  disabled?: boolean
  readOnly?: boolean | `mode-disabled` | `mode-copy`
  maxLength?: number
  minLength?: number
  rows?: number
  placeholder?: string
  onBlur?: (e:InputFocusEvent) => void
  onChange?: (e:InputChangeEvent) => void
  onCopy?: (value:string) => void | null | string
  autoComplete?: AutoComplete
  validate?: (value:string) => string
}

export default function Input( props:InputProps ) {
  const [ datasetProp, setDatasetProp ] = useState<undefined | string>( undefined )
  const [ internalValue, setInternalValue ] = useState<undefined | string>( props.value == undefined ? props.initialValue ?? `` : undefined )
  const inputRef = useRef<null | HTMLInputElement | HTMLTextAreaElement>( null )

  const inputType = select( props.type, {
    "multiline-text": `text`,
    password: `password`,
    default: `text`,
  } )

  const value = props.value ?? internalValue
  const nativeInputProps = {
    name: props.name,
    className: typeof props.className === `object` ? props.className.override : cn( classes.input, props.className ),
    style: props.style,
    defaultValue: props.initialValue,
    disabled: props.disabled,
    readOnly: !!props.readOnly,
    maxLength: props.maxLength,
    minLength: props.minLength,
    autoComplete: props.autoComplete,
    placeholder: props.placeholder,
    [ `data-copyable` ]: props.readOnly === `mode-copy` ? `` : undefined,
    value,
    onBlur: (e:FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (!props.onBlur) return

      const enhancedEvent:InputFocusEvent = { ...e, value:e.target.value, setValue:setInternalValue }
      props.onChange?.( enhancedEvent )
    },
    onChange: (e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      let newValue = e.target.value

      if (props.validate) newValue = props.validate( newValue )

      if (newValue === value) return
      if (props.value === undefined) setInternalValue( newValue )
      if (!props.onChange) return

      const enhancedEvent:InputChangeEvent = { ...e, value:newValue, setValue:setInternalValue }
      props.onChange?.( enhancedEvent )
    },
  }

  if (props.width) {
    nativeInputProps.style ||= {}
    nativeInputProps.style.width = typeof props.width === `number`
      ? `min( ${props.width}px, 100% )`
      : `min( ${props.width}, 100% )`
  }


  useEffect( () => {
    const input = inputRef.current

    if (!input || props.readOnly !== `mode-copy`) return

    const handler = async() => {
      const value = props.value ?? props.initialValue ?? ``

      const checkedValue = props.onCopy?.( value )
      const overrridedValue = checkedValue === null ? undefined : checkedValue ?? value

      if (overrridedValue) await copy( overrridedValue )

      setDatasetProp( `copied` )
    }

    input.addEventListener( `click`, handler )
    return () => input.removeEventListener( `click`, handler )
  }, [ props.readOnly, props.value, props.initialValue ] ) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect( () => {
    const id = setTimeout( () => setDatasetProp( undefined ), 1000 )
    return () => clearTimeout( id )
  }, [ datasetProp ] )


  return props.type === `multiline-text` ? (
    <textarea
      ref={inputRef as MutableRefObject<HTMLTextAreaElement>}
      rows={props.rows}
      {...nativeInputProps}
    />
  ) : (
    <input
      ref={inputRef as MutableRefObject<HTMLInputElement>}
      type={inputType}
      {...nativeInputProps}
    />
  )
}

function parseIntValue( val:string ) {
  return val.replace( /[^\d]/g, `` )
}
