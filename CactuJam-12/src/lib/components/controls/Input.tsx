import { ChangeEvent, FocusEvent, useRef, ReactNode, useState, useEffect, MutableRefObject } from "react"
import { CSSClassesValues, CSSProperties } from "@lib/theming/types"
import createStylesHook from "@lib/theming/createStylesHook"
import cn from "@lib/theming/createClassName"
import { getWindow } from "@lib/core/functions"
import { AutoComplete } from "./autocomplete"

export type InputEvent<T> = T & { value: string; setValue: (value:string) => void}

export type InputFocusEvent = InputEvent<FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>>
export type InputChangeEvent = InputEvent<ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>
export type InputType = `clear` | `text` | `multiline-text` | `password` | `time` | `int`

export type InputProps = {
  id?: string
  className?: string
  placeholderClassName?: string
  value?: string
  style?: CSSProperties
  type?: InputType
  name: string
  disabled?: boolean
  readOnly?: boolean | `mode-disabled` | `mode-copy`
  maxLength?: number
  minLength?: number
  rows?: number
  placeholder?: ReactNode
  onBlur?: (e:InputFocusEvent) => void
  onChange?: (e:InputChangeEvent) => void
  onCopy?: (value:string) => void | null | string
  autoComplete?: AutoComplete
  validate?: (value:string) => string
}

export default function Input({ id, className, placeholderClassName, style, value:externalValue, type = `text`, name, disabled, readOnly, autoComplete, placeholder, maxLength, minLength, rows, onBlur, onChange, onCopy, validate }:InputProps) {
  const [ datasetProp, setDatasetProp ] = useState<undefined | string>( undefined )
  const [ internalValue, setInternalValue ] = useState<undefined | string>( undefined )
  const [ classes ] = useStyles()
  const inputRef = useRef<null | HTMLInputElement | HTMLTextAreaElement>( null )

  const value = externalValue ?? internalValue
  const props = {
    id,
    className: type == `clear` ? classes.nativeIinputClear : classes.nativeIinput,
    name,
    disabled,
    readOnly: !!readOnly,
    [ `data-copyable` ]: readOnly === `mode-copy` ? `` : undefined,
    maxLength,
    minLength,
    defaultValue: onChange || readOnly ? undefined : externalValue,
    value: externalValue === undefined ? internalValue : externalValue,
    autoComplete,
    onBlur: (e:FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (!onBlur) return

      const enhancedEvent:InputFocusEvent = { ...e, value:e.target.value, setValue:setInternalValue }
      onChange?.( enhancedEvent )
    },
    onChange: (e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      let newValue = e.target.value

      if (type === `int`) newValue = parseIntValue( newValue )

      if (validate) newValue = validate( newValue )

      if (newValue === value) return
      if (externalValue === undefined) setInternalValue( newValue )
      if (!onChange) return

      const enhancedEvent:InputChangeEvent = { ...e, value:newValue, setValue:setInternalValue }
      onChange?.( enhancedEvent )
    },
  }


  useEffect( () => {
    const input = inputRef.current

    if (!input || readOnly !== `mode-copy`) return

    const handler = async() => {
      const clipboard = getWindow()?.navigator.clipboard
      const value = props.value ?? props.defaultValue ?? ``

      const checkedValue = onCopy?.( value )
      const overrridedValue = checkedValue === null ? undefined : checkedValue ?? value

      if (overrridedValue) await clipboard?.writeText( overrridedValue )

      setDatasetProp( `copied` )
    }

    input.addEventListener( `click`, handler )
    return () => input.removeEventListener( `click`, handler )
  }, [ readOnly, props.value, props.defaultValue ] )

  useEffect( () => {
    const id = setTimeout( () => setDatasetProp( undefined ), 1000 )
    return () => clearTimeout( id )
  }, [ datasetProp ] )

  return (
    <div className={cn( classes.input, className )} style={style} {...(!datasetProp ? {} : { [ `data-${datasetProp}` ]:`` })}>
      {
        type === `multiline-text` ? (
          <textarea
            ref={inputRef as MutableRefObject<HTMLTextAreaElement>}
            {...props}
            rows={rows}
          />
        ) : (
          <input
            ref={inputRef as MutableRefObject<HTMLInputElement>}
            type={type}
            {...props}
          />
        )
      }

      {
        ![ `time` ].includes( type ) && (type != `clear` || !value) && (
          <fieldset className={cn( classes[ type == `clear` ? `placeholderClear` : `placeholder` ], !value && type != `clear` && classes.innerPlaceholder )}>
            <legend className={placeholderClassName}>{placeholder}</legend>
          </fieldset>
        )
      }
    </div>
  )
}

function getStylesWithPredicate( props:undefined | CSSClassesValues, predicate:(k:string, v:unknown) => boolean ) {
  return !props ? {} : Object.fromEntries( Object.entries( props ).filter( ([ k, v ]) => predicate( k, v ) ) )
}

const useStyles = createStylesHook( ({ components }) => ({
  input: {
    position: `relative`,
    borderRadius: components.Input?.borderRadius,
    backgroundColor: components.Input?.backgroundColor,
    textAlign: `left`,
    padding: 0,

    ...getStylesWithPredicate( components.Input, k => !k.includes( `padding` ) && (!k.includes( `border` ) || k.includes( `Radius` )) ),
  },

  nativeIinputClear: {
    position: `relative`,
    display: `block`,
    width: `100%`,
    height: `100%`,
    lineHeight: `inherit`,
    font: `inherit`,
    color: `inherit`,
    border: `none`,
    backgroundColor: `unset`,
    zIndex: 1,

    "& + *": {
      border: `none`,
    },
  },

  nativeIinput: {
    position: `relative`,
    color: `inherit`,

    ...getStylesWithPredicate( components.Input, k => !k.includes( `margin` ) && !k.includes( `border` ) ),
    // borderWidth: components.Input?.borderWidth ?? components.Input?.border.match( /^\d+\w+/ )?.[ 0 ] ?? 0,
    borderWidth: components.Input?.borderWidth ?? components.Input?.border.match( /^\d+\w+/ )?.[ 0 ] ?? 0,
    borderStyle: `solid`,
    borderColor: `transparent`,

    "& + *": {
      border: components.Input?.border,
      borderWidth: components.Input?.borderWidth,
    },

    "&:focus-visible": {
      outlineWidth: components.Input?.borderWidth,
      outlineOffset: `-0.4em`,
      ...components.Input?.[ `&:focus-visible` ],
      borderColor: `transparent`,
    },

    backgroundColor: `unset`,
    zIndex: 1,
  },

  placeholderClear: {
    position: `absolute`,
    inset: 0,
    margin: 0,
    padding: 0,
  },
  placeholder: {
    position: `absolute`,
    inset: 0,
    margin: 0,
    padding: components.Input?.padding ?? 0,

    // ...getStylesWithPredicate( components.Input, k => k.includes( `margin` ) || k.includes( `border` ) ),
    ...getStylesWithPredicate( components.Input, k => true
      && !k.includes( `margin` )
      && !k.includes( `height` )
      && (!k.includes( `border` ) || k.includes( `Radius` )),
    ),

    "& > legend": {
      position: `relative`,
      top: `-0.8em`,
      margin: 0,
      height: 1,
      // opacity: 0.5,
      // font: `inherit`,

    },
  },
  innerPlaceholder: {
    "& > legend": {
      position: `absolute`,
      transform: `translateY( calc( 100% - 0.2em ) )`,
      width: `100%`,
      height: `unset`,
    },
  },
}), `lib::Input` )

function parseIntValue( val:string ) {
  return val.replace( /[^\d]/g, `` )
}
