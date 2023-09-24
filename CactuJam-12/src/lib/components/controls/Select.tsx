import { useState, useRef, useEffect, ReactNode } from "react"
import { CSSProperties, cn, createStylesHook } from "../../theming"
import getWindow from "../../core/functions/getWindow"

export type FieldComponentProps = { value: string}
export type SelectProps<T extends string = string> = {
  className?: string
  style: CSSProperties
  name: string
  values: string[]
  placeholder?: ReactNode
  icon?: ReactNode
  fieldComponent: (props:FieldComponentProps) => JSX.Element
  onChange: (value:T) => void
}

export default function Select<T extends string = string>({ className, style, name, placeholder, icon, values, fieldComponent:FieldComponent, onChange }:SelectProps<T>) {
  // const nativeSelectId = useId()
  const [ value, setValue ] = useState( values[ 0 ] )
  const [ classes ] = useStyles()
  const fieldsetRef = useRef<HTMLFieldSetElement>( null )
  const dropdownRef = useRef<HTMLOListElement>( null )

  const show = () => dropdownRef.current && (dropdownRef.current.ariaExpanded = ``)
  const hide = () => dropdownRef.current && (dropdownRef.current.ariaExpanded = null)
  const handleSelect = (value:T) => {
    hide()
    setValue( value )
    onChange?.( value )
  }

  useEffect( () => {
    const fieldset = fieldsetRef.current
    if (!fieldset) return

    const handleClick = (e:MouseEvent) => {
      const path = e.composedPath()
      if (path.includes( fieldset )) show()
      else hide()
    }

    getWindow()?.addEventListener( `click`, handleClick, true )
    return () => getWindow()?.removeEventListener( `click`, handleClick, true )
  }, [ fieldsetRef.current ] )

  return (
    <fieldset ref={fieldsetRef} className={cn( classes.select )} style={style}>
      <input name={name} hidden readOnly value={value} />

      <output className={cn( classes.value, className )}>
        {value ?? (typeof icon === `object` ? placeholder : <div>{placeholder}</div>) ?? <>&nbsp;</>}
        {typeof icon === `object` ? icon : <div>{icon}</div>}
      </output>

      {/* <select name={name} id={nativeSelectId} className={classes.nativeSelect}>
        {values.map( v => <option key={v}>{v}</option> )}
      </select> */}

      <ol ref={dropdownRef} className={classes.values}>
        {
          values.map( v => (
            <li key={v}>
              <button type="button" onClick={() => handleSelect( v as T )}>
                <FieldComponent value={v} />
              </button>
            </li>
          ) )
        }
      </ol>
    </fieldset>
  )
}

const useStyles = createStylesHook( ({ components }) => ({
  select: {
    position: `relative`,
    display: `flex`,
    margin: 0,
    padding: 0,
    border: `none`,
    textAlign: `left`,
    cursor: `pointer`,
  },

  value: {
    display: `flex`,
    justifyContent: `space-between`,
    alignItems: `center`,
    width: `100%`,

    ...components.Select,
  },

  nativeSelect: {
    width: 1,
    height: 1,
    border: `none`,
    outline: `none`,
  },

  values: {
    position: `absolute`,
    left: 0,
    top: 0,
    margin: 0,
    padding: 0,
    listStyle: `none`,
    width: `100%`,
    zIndex: 10,
    overflow: `hidden`,

    "&:not([aria-expanded])": {
      display: `none`,
    },

    ...components.Select_Dropdown,

    "& > li > button": {
      width: `100%`,
      border: `none`,
      background: `none`,
      font: `inherit`,
      textAlign: `inherit`,
      cursor: `pointer`,

      ...components.Select_Dropdown_Value,
    },
  },
}) )
